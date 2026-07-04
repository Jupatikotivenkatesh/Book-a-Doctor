const asyncHandler = require("express-async-handler");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const Appointment = require("../models/Appointment");

// ─── @desc    Get user profile
// ─── @route   GET /api/users/profile
// ─── @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("doctorProfile");

  res.status(200).json({
    success: true,
    data: user,
  });
});

// ─── @desc    Update user profile
// ─── @route   PUT /api/users/profile
// ─── @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const { name, phone, address } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.name = name || user.name;
  user.phone = phone !== undefined ? phone : user.phone;
  user.address = address !== undefined ? address : user.address;

  const updatedUser = await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      profilePicture: updatedUser.profilePicture,
      role: updatedUser.role,
    },
  });
});

// ─── @desc    Upload profile picture
// ─── @route   POST /api/users/profile/picture
// ─── @access  Private
const uploadProfilePicture = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No file uploaded");
  }

  const user = await User.findById(req.user._id);

  // Delete old profile picture if exists
  if (user.profilePicture) {
    const oldPath = path.join(__dirname, "../", user.profilePicture);
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  user.profilePicture = `/uploads/profiles/${req.file.filename}`;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile picture updated",
    data: { profilePicture: user.profilePicture },
  });
});

// ─── @desc    Get patient's appointment history
// ─── @route   GET /api/users/appointments
// ─── @access  Private (patient)
const getMyAppointments = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const filter = { patientId: req.user._id };
  if (status) filter.status = status;

  const [appointments, total] = await Promise.all([
    Appointment.find(filter)
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
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  getMyAppointments,
};
