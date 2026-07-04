const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const appointmentSchema = new mongoose.Schema(
  {
    // Participants
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    // Scheduling
    date: {
      type: String, // "YYYY-MM-DD"
      required: [true, "Appointment date is required"],
    },
    time: {
      type: String, // "HH:MM"
      required: [true, "Appointment time is required"],
    },
    // Appointment Details
    reason: {
      type: String,
      required: [true, "Reason for visit is required"],
      maxlength: [500, "Reason cannot exceed 500 characters"],
    },
    symptoms: {
      type: String,
      default: "",
      maxlength: [1000, "Symptoms description cannot exceed 1000 characters"],
    },
    notes: {
      type: String,
      default: "",
    },
    // Uploaded Medical Documents
    documents: [documentSchema],
    // Workflow Status
    status: {
      type: String,
      enum: [
        "pending",       // Patient booked, awaiting doctor approval
        "approved",      // Doctor approved
        "rejected",      // Doctor rejected
        "completed",     // Consultation done
        "cancelled",     // Cancelled by patient or doctor
      ],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    // Consultation Details (filled after appointment)
    consultationNotes: {
      type: String,
      default: "",
    },
    prescription: {
      type: String,
      default: "",
    },
    followUpDate: {
      type: Date,
      default: null,
    },
    followUpSummary: {
      type: String,
      default: "",
    },
    // Fee
    feeCharged: {
      type: Number,
      default: 0,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    // Rating given by patient after consultation
    rating: {
      score: { type: Number, min: 1, max: 5, default: null },
      review: { type: String, default: "" },
      ratedAt: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes for common queries ────────────────────────────────────────────────
appointmentSchema.index({ patientId: 1, status: 1 });
appointmentSchema.index({ doctorId: 1, status: 1 });
appointmentSchema.index({ date: 1, doctorId: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);
