const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // Recipient
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Notification Content
    type: {
      type: String,
      enum: [
        "appointment_booked",
        "appointment_approved",
        "appointment_rejected",
        "appointment_cancelled",
        "appointment_completed",
        "doctor_approved",
        "doctor_rejected",
        "follow_up_reminder",
        "document_uploaded",
        "general",
      ],
      required: true,
    },
    title: {
      type: String,
      required: [true, "Notification title is required"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    // Optional reference to related entity
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    referenceModel: {
      type: String,
      enum: ["Appointment", "Doctor", "User", null],
      default: null,
    },
    // Read status
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    // Email delivery status
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Index for fast unread count queries ──────────────────────────────────────
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
