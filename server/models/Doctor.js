const mongoose = require("mongoose");

const timingSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: true,
    },
    startTime: { type: String, required: true }, // e.g. "09:00"
    endTime: { type: String, required: true },   // e.g. "17:00"
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    // Link to User account
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    // Personal / Professional Info
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    website: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    specialization: {
      type: String,
      required: [true, "Specialization is required"],
      trim: true,
    },
    experience: {
      type: Number,
      required: [true, "Years of experience is required"],
      min: [0, "Experience cannot be negative"],
    },
    feePerConsultation: {
      type: Number,
      required: [true, "Consultation fee is required"],
      min: [0, "Fee cannot be negative"],
    },
    qualifications: [
      {
        degree: { type: String, required: true },
        institution: { type: String, required: true },
        year: { type: Number, required: true },
      },
    ],
    timings: [timingSchema],
    profilePicture: {
      type: String,
      default: "",
    },
    // Admin approval workflow
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    // Ratings
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Virtual: full name ────────────────────────────────────────────────────────
doctorSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

doctorSchema.set("toJSON", { virtuals: true });
doctorSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Doctor", doctorSchema);
