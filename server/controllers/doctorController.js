const asyncHandler = require("express-async-handler");
const Doctor = require("../models/Doctor");
const User = require("../models/User");
const Appointment = require("../models/Appointment");
const { createNotification } = require("../utils/notificationService");
const { appointmentApproved, appointmentRejected } = require("../utils/emailTemplates");

// ─── @desc    Apply to become a doctor
// ─── @route   POST /api/doctors/apply
// ─── @access  Private (patient)
const applyDoctor = asyncHandler(async (req, res) => {
  const {
    firstName, lastName, phone, website, address,
    specialization, experience, feePerConsultation,
    qualifications, timings,
  } = req.body;

  // Prevent duplicate applications
  const existing = await Doctor.findOne({ userId: req.user._id });
  if (existing) {
    res.status(400);
    throw new Error("You have already submitted a doctor application");
  }

  const doctor = await Doctor.create({
    userId: req.user._id,
    firstName, lastName, phone,
    website: website || "",
    address, specialization,
    experience: Number(experience),
    feePerConsultation: Number(feePerConsultation),
    qualifications: qualifications || [],
    timings: timings || [],
  });

  // Notify all admins
  const admins = await User.find({ role: "admin" });
  await Promise.all(
    admins.map((admin) =>
      createNotification({
        userId: admin._id,
        type: "general",
        title: "New Doctor Application",
        message: `Dr. ${firstName} ${lastName} has applied. Please review.`,
        referenceId: doctor._id,
        referenceModel: "Doctor",
      })
    )
  );

  res.status(201).json({
    success: true,
    message: "Doctor application submitted. Awaiting admin approval.",
    data: doctor,
  });
});

// ─── @desc    Get all approved doctors (public browsing)
// ─── @route   GET /api/doctors
// ─── @access  Public
const getAllDoctors = asyncHandler(async (req, res) => {
  const {
    specialization, minFee, maxFee, minExp,
    search, page = 1, limit = 12,
  } = req.query;

  const filter = { status: "approved", isAvailable: true };

  if (specialization) filter.specialization = new RegExp(specialization, "i");
  if (minFee || maxFee) {
    filter.feePerConsultation = {};
    if (minFee) filter.feePerConsultation.$gte = Number(minFee);
    if (maxFee) filter.feePerConsultation.$lte = Number(maxFee);
  }
  if (minExp) filter.experience = { $gte: Number(minExp) };
  if (search) {
    filter.$or = [
      { firstName: new RegExp(search, "i") },
      { lastName: new RegExp(search, "i") },
      { specialization: new RegExp(search, "i") },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [doctors, total] = await Promise.all([
    Doctor.find(filter)
      .populate("userId", "name email profilePicture")
      .sort({ averageRating: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Doctor.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: doctors,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// ─── @desc    Get single doctor by ID
// ─── @route   GET /api/doctors/:id
// ─── @access  Public
const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id).populate(
    "userId",
    "name email profilePicture"
  );

  if (!doctor) {
    res.status(404);
    throw new Error("Doctor not found");
  }

  res.status(200).json({ success: true, data: doctor });
});

// ─── @desc    Get doctor profile (own)
// ─── @route   GET /api/doctors/profile/me
// ─── @access  Private (doctor)
const getMyDoctorProfile = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ userId: req.user._id }).populate(
    "userId",
    "name email profilePicture"
  );

  if (!doctor) {
    res.status(404);
    throw new Error("Doctor profile not found");
  }

  res.status(200).json({ success: true, data: doctor });
});

// ─── @desc    Update doctor profile
// ─── @route   PUT /api/doctors/profile/me
// ─── @access  Private (doctor)
const updateDoctorProfile = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ userId: req.user._id });

  if (!doctor) {
    res.status(404);
    throw new Error("Doctor profile not found");
  }

  const updatableFields = [
    "firstName", "lastName", "phone", "website", "address",
    "specialization", "experience", "feePerConsultation",
    "qualifications", "timings", "isAvailable",
  ];

  updatableFields.forEach((field) => {
    if (req.body[field] !== undefined) doctor[field] = req.body[field];
  });

  const updated = await doctor.save();
  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: updated,
  });
});

// ─── @desc    Doctor approves or rejects an appointment
// ─── @route   PUT /api/doctors/appointments/:appointmentId/status
// ─── @access  Private (doctor)
const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status, rejectionReason } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    res.status(400);
    throw new Error("Status must be 'approved' or 'rejected'");
  }

  const doctor = await Doctor.findOne({ userId: req.user._id });
  if (!doctor) {
    res.status(404);
    throw new Error("Doctor profile not found");
  }

  const appointment = await Appointment.findById(req.params.appointmentId)
    .populate("patientId", "name email notificationPreference")
    .populate("doctorId");

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  if (appointment.doctorId._id.toString() !== doctor._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to update this appointment");
  }

  if (appointment.status !== "pending") {
    res.status(400);
    throw new Error("Only pending appointments can be updated");
  }

  appointment.status = status;
  if (status === "rejected" && rejectionReason) {
    appointment.rejectionReason = rejectionReason;
  }

  await appointment.save();

  // Notify patient
  const patient = appointment.patientId;
  const doctorName = `${doctor.firstName} ${doctor.lastName}`;

  if (status === "approved") {
    await createNotification({
      userId: patient._id,
      type: "appointment_approved",
      title: "Appointment Approved",
      message: `Your appointment with Dr. ${doctorName} on ${appointment.date} at ${appointment.time} has been approved.`,
      referenceId: appointment._id,
      referenceModel: "Appointment",
      email: patient.notificationPreference?.email ? patient.email : null,
      emailSubject: "Your Appointment Has Been Approved",
      emailHtml: appointmentApproved(patient.name, doctorName, appointment.date, appointment.time),
    });
  } else {
    await createNotification({
      userId: patient._id,
      type: "appointment_rejected",
      title: "Appointment Not Approved",
      message: `Your appointment with Dr. ${doctorName} was not approved. ${rejectionReason || ""}`,
      referenceId: appointment._id,
      referenceModel: "Appointment",
      email: patient.notificationPreference?.email ? patient.email : null,
      emailSubject: "Appointment Update",
      emailHtml: appointmentRejected(patient.name, doctorName, rejectionReason),
    });
  }

  res.status(200).json({
    success: true,
    message: `Appointment ${status} successfully`,
    data: appointment,
  });
});

// ─── @desc    Get doctor's appointments
// ─── @route   GET /api/doctors/appointments
// ─── @access  Private (doctor)
const getDoctorAppointments = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const doctor = await Doctor.findOne({ userId: req.user._id });
  if (!doctor) {
    res.status(404);
    throw new Error("Doctor profile not found");
  }

  const filter = { doctorId: doctor._id };
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [appointments, total] = await Promise.all([
    Appointment.find(filter)
      .populate("patientId", "name email phone profilePicture")
      .sort({ date: 1, time: 1 })
      .skip(skip)
      .limit(Number(limit)),
    Appointment.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: appointments,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// ─── @desc    Add consultation notes and follow-up summary
// ─── @route   PUT /api/doctors/appointments/:appointmentId/complete
// ─── @access  Private (doctor)
const completeAppointment = asyncHandler(async (req, res) => {
  const { consultationNotes, prescription, followUpDate, followUpSummary } = req.body;

  const doctor = await Doctor.findOne({ userId: req.user._id });
  if (!doctor) {
    res.status(404);
    throw new Error("Doctor profile not found");
  }

  const appointment = await Appointment.findById(req.params.appointmentId);
  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  if (appointment.doctorId.toString() !== doctor._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  if (appointment.status !== "approved") {
    res.status(400);
    throw new Error("Only approved appointments can be completed");
  }

  appointment.status = "completed";
  appointment.consultationNotes = consultationNotes || "";
  appointment.prescription = prescription || "";
  appointment.followUpDate = followUpDate ? new Date(followUpDate) : null;
  appointment.followUpSummary = followUpSummary || "";

  await appointment.save();

  // Notify patient
  const patient = await User.findById(appointment.patientId).select("name email notificationPreference");
  await createNotification({
    userId: patient._id,
    type: "appointment_completed",
    title: "Consultation Completed",
    message: `Your consultation with Dr. ${doctor.firstName} ${doctor.lastName} has been completed. View your prescription and follow-up details.`,
    referenceId: appointment._id,
    referenceModel: "Appointment",
  });

  res.status(200).json({
    success: true,
    message: "Appointment completed successfully",
    data: appointment,
  });
});

// ─── @desc    Get all unique specializations
// ─── @route   GET /api/doctors/specializations
// ─── @access  Public
const getSpecializations = asyncHandler(async (req, res) => {
  const specializations = await Doctor.distinct("specialization", { status: "approved" });
  res.status(200).json({ success: true, data: specializations });
});

module.exports = {
  applyDoctor,
  getAllDoctors,
  getDoctorById,
  getMyDoctorProfile,
  updateDoctorProfile,
  updateAppointmentStatus,
  getDoctorAppointments,
  completeAppointment,
  getSpecializations,
};
