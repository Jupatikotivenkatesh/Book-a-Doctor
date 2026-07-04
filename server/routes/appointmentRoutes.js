const express = require("express");
const router = express.Router();
const {
  bookAppointment,
  getAppointmentById,
  uploadDocuments,
  cancelAppointment,
  rateAppointment,
} = require("../controllers/appointmentController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { uploadDocuments: multerUpload, handleUploadError } = require("../middleware/uploadMiddleware");

router.post("/", protect, authorize("patient"), bookAppointment);
router.get("/:id", protect, getAppointmentById);
router.post(
  "/:id/documents",
  protect,
  authorize("patient"),
  multerUpload.array("documents", 5),
  handleUploadError,
  uploadDocuments
);
router.put("/:id/cancel", protect, cancelAppointment);
router.post("/:id/rate", protect, authorize("patient"), rateAppointment);

module.exports = router;
