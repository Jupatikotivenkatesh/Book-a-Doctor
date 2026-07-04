const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const { createNotification } = require("../utils/notificationService");
const { doctorApproved, doctorRejected } = require("../utils/emailTemplates");

// ─── @desc    Get dashboard stats
// ─── @route   GET /api/admin/stats
// ─── @access  Private (admin)
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalDoctors,
    totalAppointments,
    pendingDoctors,
    pendingAppointments,
    completedAppointments,
  ] = await Promise.all([
    User.countDocuments({ role: "patient" }),
    Doctor.countDocuments({ status: "approved" }),
    Appointment.countDocuments(),
    Doctor.countDocuments({ status: "pending" }),
    Appointment.countDocuments({ status: "pending" }),
    Appointment.countDocuments({ status: "completed" }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalDoctors,
      totalAppointments,
      pendingDoctors,
      pendingAppointments,
      completedAppointments,
    },
  });
});

// ─── @desc    Get all users
// ─── @route   GET /api/admin/users
// ─── @access  Private (admin)
const getAllUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 20, search } = req.query;
  const filter = {};

  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: new RegExp(search, "i") },
      { email: new RegExp(search, "i") },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: users,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// ─── @desc    Toggle user active/inactive
// ─── @route   PUT /api/admin/users/:id/toggle-status
// ─── @access  Private (admin)
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.role === "admin") {
    res.status(400);
    throw new Error("Cannot deactivate an admin account");
  }

  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
    data: { isActive: user.isActive },
  });
});

// ─── @desc    Get all doctor applications
// ─── @route   GET /api/admin/doctors
// ─── @access  Private (admin)
const getAllDoctorApplications = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [doctors, total] = await Promise.all([
    Doctor.find(filter)
      .populate("userId", "name email phone profilePicture")
      .sort({ createdAt: -1 })
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

// ─── @desc    Approve or reject a doctor application
// ─── @route   PUT /api/admin/doctors/:id/status
// ─── @access  Private (admin)
const updateDoctorStatus = asyncHandler(async (req, res) => {
  const { status, rejectionReason } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    res.status(400);
    throw new Error("Status must be 'approved' or 'rejected'");
  }

  const doctor = await Doctor.findById(req.params.id).populate(
    "userId",
    "name email notificationPreference"
  );

  if (!doctor) {
    res.status(404);
    throw new Error("Doctor not found");
  }

  if (doctor.status !== "pending") {
    res.status(400);
    throw new Error("Only pending applications can be updated");
  }

  doctor.status = status;
  if (status === "rejected" && rejectionReason) {
    doctor.rejectionReason = rejectionReason;
  }
  await doctor.save();

  const doctorUser = doctor.userId;
  const doctorName = `${doctor.firstName} ${doctor.lastName}`;

  if (status === "approved") {
    // Upgrade user role to "doctor"
    await User.findByIdAndUpdate(doctorUser._id, {
      role: "doctor",
      doctorProfile: doctor._id,
    });

    await createNotification({
      userId: doctorUser._id,
      type: "doctor_approved",
      title: "Application Approved",
      message: "Congratulations! Your doctor application has been approved. You can now accept appointments.",
      referenceId: doctor._id,
      referenceModel: "Doctor",
      email: doctorUser.notificationPreference?.email ? doctorUser.email : null,
      emailSubject: "Your Doctor Application Has Been Approved",
      emailHtml: doctorApproved(doctorName),
    });
  } else {
    await createNotification({
      userId: doctorUser._id,
      type: "doctor_rejected",
      title: "Application Update",
      message: `Your doctor application was not approved. ${rejectionReason || ""}`,
      referenceId: doctor._id,
      referenceModel: "Doctor",
      email: doctorUser.notificationPreference?.email ? doctorUser.email : null,
      emailSubject: "Doctor Application Update",
      emailHtml: doctorRejected(doctorName, rejectionReason),
    });
  }

  res.status(200).json({
    success: true,
    message: `Doctor application ${status} successfully`,
    data: doctor,
  });
});

// ─── @desc    Get all appointments (admin overview)
// ─── @route   GET /api/admin/appointments
// ─── @access  Private (admin)
const getAllAppointments = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [appointments, total] = await Promise.all([
    Appointment.find(filter)
      .populate("patientId", "name email")
      .populate({ path: "doctorId", populate: { path: "userId", select: "name email" } })
      .sort({ createdAt: -1 })
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

module.exports = {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  getAllDoctorApplications,
  updateDoctorStatus,
  getAllAppointments,
};
