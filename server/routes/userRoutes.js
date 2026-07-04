const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  getMyAppointments,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { uploadProfile, handleUploadError } = require("../middleware/uploadMiddleware");

router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.post(
  "/profile/picture",
  protect,
  uploadProfile.single("profilePicture"),
  handleUploadError,
  uploadProfilePicture
);
router.get("/appointments", protect, getMyAppointments);

module.exports = router;
