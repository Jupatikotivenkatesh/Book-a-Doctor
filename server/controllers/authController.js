const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");
const { welcomeEmail } = require("../utils/emailTemplates");

// ─── @desc    Register new user
// ─── @route   POST /api/auth/register
// ─── @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email, and password are required");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    res.status(400);
    throw new Error("Email already registered");
  }

  const user = await User.create({ name, email, password, phone: phone || "" });

  // Send welcome email (non-blocking)
  sendEmail({
    to: user.email,
    subject: "Welcome to Book a Doctor",
    html: welcomeEmail(user.name),
  });

  res.status(201).json({
    success: true,
    message: "Registration successful",
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    },
  });
});

// ─── @desc    Login user
// ─── @route   POST /api/auth/login
// ─── @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error("Your account has been deactivated. Contact support.");
  }

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      profilePicture: user.profilePicture,
      doctorProfile: user.doctorProfile,
      token: generateToken(user._id),
    },
  });
});

// ─── @desc    Get current logged-in user
// ─── @route   GET /api/auth/me
// ─── @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("doctorProfile");

  res.status(200).json({
    success: true,
    data: user,
  });
});

// ─── @desc    Update password
// ─── @route   PUT /api/auth/change-password
// ─── @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("Current and new passwords are required");
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error("New password must be at least 6 characters");
  }

  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});

module.exports = { register, login, getMe, changePassword };
