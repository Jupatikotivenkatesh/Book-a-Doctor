const asyncHandler = require("express-async-handler");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const User = require("../models/User");
const { createNotification } = require("../utils/notificationService");
const {
  appointmentBookedPatient,
  appointmentBookedDoctor,
} = require("../utils/emailTemplates");

// ─── @desc    Book an appointment
// ─── @route   POST /api/appointments
// ─── @access  Private (patient)
const bookAppointment = asyncHandler(async (req, res) => {
  const { doctorId, date, time, reason, symptoms } = req.body;

  if (!doctorId || !date || !time || !reason) {
    res.status(400);
    throw new Error("Doctor, date, time and reason are required");
  }

  const doctor = await Doctor.findById(doctorId).populate("userId", "name email notificationPreference");
  if (!doctor) {
    res.status(404);
    throw new Error("Doctor not found");
  }

  if (doctor.status !== "approved") {
    res.status(400);
    throw new Error("This doctor is not currently accepting appointments");
  }

  // Check for slot conflict
  const conflict = await Appointment.findOne({
    doctorId,
    date,
    time,
    status: { $in: ["pending", "approved"] },
  });

  if (conflict) {
    res.status(400);
    throw new Error("This time slot is already booked. Please choose another time.");
  }

  const appointment = await Appointment.create({
    patientId: req.user._id,
    doctorId,
    date,
    time,
    reason,
    symptoms: symptoms || "",
    feeCharged: doctor.feePerConsultation,
  });

  const patient = req.user;
  const doctorName = `${doctor.firstName} ${doctor.lastName}`;

  // Notify patient
  await createNotification({
    userId: patient._id,
    type: "appointment_booked",
    title: "Appointment Booked",
    message: `Your appointment with Dr. ${doctorName} on ${date} at ${time} has been submitted for approval.`,
    referenceId: appointment._id,
    referenceModel: "Appointment",
    email: patient.notificationPreference?.email ? patient.email : null,
    emailSubject: "Appointment Booking Confirmation",
    emailHtml: appointmentBookedPatient(patient.name, doctorName, date, time),
  });

  // Notify doctor
  const doctorUser = doctor.userId;
  if (doctorUser) {
    await createNotification({
      userId: doctorUser._id,
      type: "appointment_booked",
      title: "New Appointment Request",
      message: `${patient.name} has booked an appointment on ${date} at ${time}. Reason: ${reason}`,
      referenceId: appointment._id,
      referenceModel: "Appointment",
      email: doctorUser.notificationPreference?.email ? doctorUser.email : null,
      emailSubject: "New Appointment Request",
      emailHtml: appointmentBookedDoctor(doctorName, patient.name, date, time, reason),
    });
  }

  res.status(201).json({
    success: true,
    message: "Appointment booked successfully. Waiting for doctor approval.",
    data: appointment,
  });
});

// ─── @desc    Get single appointment
// ─── @route   GET /api/appointments/:id
// ─── @access  Private
const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate("patientId", "name email phone profilePicture")
    .populate({
      path: "doctorId",
      populate: { path: "userId", select: "name email profilePicture" },
    });

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  // Only patient, doctor, or admin can view
  const isPatient = appointment.patientId._id.toString() === req.user._id.toString();
  const doctorUserId = appointment.doctorId?.userId?._id?.toString();
  const isDoctor = doctorUserId === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isPatient && !isDoctor && !isAdmin) {
    res.status(403);
    throw new Error("Not authorized to view this appointment");
  }

  res.status(200).json({ success: true, data: appointment });
});

// ─── @desc    Upload documents to an appointment
// ─── @route   POST /api/appointments/:id/documents
// ─── @access  Private (patient)
const uploadDocuments = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error("No files uploaded");
  }

  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  if (appointment.patientId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to upload documents to this appointment");
  }

  if (!["pending", "approved"].includes(appointment.status)) {
    res.status(400);
    throw new Error("Documents can only be uploaded for pending or approved appointments");
  }

  const newDocuments = req.files.map((file) => ({
    filename: file.filename,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    path: `/uploads/documents/${file.filename}`,
  }));

  appointment.documents.push(...newDocuments);
  await appointment.save();

  // Notify doctor
  const doctor = await Doctor.findById(appointment.doctorId).populate("userId", "_id name notificationPreference");
  if (doctor?.userId) {
    await createNotification({
      userId: doctor.userId._id,
      type: "document_uploaded",
      title: "Documents Uploaded",
      message: `${req.user.name} has uploaded ${req.files.length} document(s) to their appointment.`,
      referenceId: appointment._id,
      referenceModel: "Appointment",
    });
  }

  res.status(200).json({
    success: true,
    message: `${req.files.length} document(s) uploaded successfully`,
    data: { documents: appointment.documents },
  });
});

// ─── @desc    Cancel an appointment
// ─── @route   PUT /api/appointments/:id/cancel
// ─── @access  Private (patient or doctor)
const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate("patientId", "name email _id")
    .populate({ path: "doctorId", populate: { path: "userId", select: "_id name" } });

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  const isPatient = appointment.patientId._id.toString() === req.user._id.toString();
  const isDoctor = appointment.doctorId?.userId?._id?.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isPatient && !isDoctor && !isAdmin) {
    res.status(403);
    throw new Error("Not authorized to cancel this appointment");
  }

  if (["completed", "cancelled"].includes(appointment.status)) {
    res.status(400);
    throw new Error("This appointment cannot be cancelled");
  }

  appointment.status = "cancelled";
  await appointment.save();

  // Notify the other party
  const cancelledBy = req.user.name;
  if (isPatient || isAdmin) {
    // Notify doctor
    const doctorUserId = appointment.doctorId?.userId?._id;
    if (doctorUserId) {
      await createNotification({
        userId: doctorUserId,
        type: "appointment_cancelled",
        title: "Appointment Cancelled",
        message: `${cancelledBy} has cancelled the appointment scheduled for ${appointment.date} at ${appointment.time}.`,
        referenceId: appointment._id,
        referenceModel: "Appointment",
      });
    }
  } else {
    // Notify patient
    await createNotification({
      userId: appointment.patientId._id,
      type: "appointment_cancelled",
      title: "Appointment Cancelled",
      message: `Your appointment on ${appointment.date} at ${appointment.time} has been cancelled by the doctor.`,
      referenceId: appointment._id,
      referenceModel: "Appointment",
    });
  }

  res.status(200).json({
    success: true,
    message: "Appointment cancelled successfully",
    data: appointment,
  });
});

// ─── @desc    Rate a completed appointment
// ─── @route   POST /api/appointments/:id/rate
// ─── @access  Private (patient)
const rateAppointment = asyncHandler(async (req, res) => {
  const { score, review } = req.body;

  if (!score || score < 1 || score > 5) {
    res.status(400);
    throw new Error("Rating score must be between 1 and 5");
  }

  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  if (appointment.patientId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to rate this appointment");
  }

  if (appointment.status !== "completed") {
    res.status(400);
    throw new Error("Only completed appointments can be rated");
  }

  if (appointment.rating.score) {
    res.status(400);
    throw new Error("You have already rated this appointment");
  }

  appointment.rating = { score, review: review || "", ratedAt: new Date() };
  await appointment.save();

  // Recalculate doctor's average rating
  const doctor = await Doctor.findById(appointment.doctorId);
  if (doctor) {
    const ratedAppointments = await Appointment.find({
      doctorId: doctor._id,
      "rating.score": { $ne: null },
    });

    const totalScore = ratedAppointments.reduce((sum, apt) => sum + apt.rating.score, 0);
    doctor.averageRating = parseFloat((totalScore / ratedAppointments.length).toFixed(1));
    doctor.totalRatings = ratedAppointments.length;
    await doctor.save();
  }

  res.status(200).json({
    success: true,
    message: "Rating submitted successfully",
    data: appointment.rating,
  });
});

module.exports = {
  bookAppointment,
  getAppointmentById,
  uploadDocuments,
  cancelAppointment,
  rateAppointment,
};
