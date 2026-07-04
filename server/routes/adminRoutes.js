const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  getAllDoctorApplications,
  updateDoctorStatus,
  getAllAppointments,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

router.get("/stats", getDashboardStats);
router.get("/users", getAllUsers);
router.put("/users/:id/toggle-status", toggleUserStatus);
router.get("/doctors", getAllDoctorApplications);
router.put("/doctors/:id/status", updateDoctorStatus);
router.get("/appointments", getAllAppointments);

module.exports = router;
