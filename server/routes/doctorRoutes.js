const express = require("express");
const router = express.Router();
const {
  applyDoctor,
  getAllDoctors,
  getDoctorById,
  getMyDoctorProfile,
  updateDoctorProfile,
  updateAppointmentStatus,
  getDoctorAppointments,
  completeAppointment,
  getSpecializations,
} = require("../controllers/doctorController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Public routes
router.get("/", getAllDoctors);
router.get("/specializations", getSpecializations);
router.get("/:id", getDoctorById);

// Authenticated routes
router.post("/apply", protect, authorize("patient", "admin"), applyDoctor);

// Doctor-only routes
router.get("/profile/me", protect, authorize("doctor"), getMyDoctorProfile);
router.put("/profile/me", protect, authorize("doctor"), updateDoctorProfile);
router.get("/appointments/list", protect, authorize("doctor"), getDoctorAppointments);
router.put(
  "/appointments/:appointmentId/status",
  protect,
  authorize("doctor"),
  updateAppointmentStatus
);
router.put(
  "/appointments/:appointmentId/complete",
  protect,
  authorize("doctor"),
  completeAppointment
);

module.exports = router;
