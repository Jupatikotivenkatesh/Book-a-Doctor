const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

// ─── Protect: verify JWT token ─────────────────────────────────────────────────
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized, user not found");
    }

    if (!req.user.isActive) {
      res.status(403);
      throw new Error("Your account has been deactivated");
    }

    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized, token failed");
  }
});

// ─── Role-based access control ────────────────────────────────────────────────
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(
        `Role '${req.user.role}' is not authorized to access this route`
      );
    }
    next();
  };
};

// ─── Admin only ───────────────────────────────────────────────────────────────
const adminOnly = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403);
    throw new Error("Admin access required");
  }
});

// ─── Doctor only ──────────────────────────────────────────────────────────────
const doctorOnly = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === "doctor") {
    next();
  } else {
    res.status(403);
    throw new Error("Doctor access required");
  }
});

module.exports = { protect, authorize, adminOnly, doctorOnly };
