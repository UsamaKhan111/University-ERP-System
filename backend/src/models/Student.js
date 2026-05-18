const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student user is required"]
    },
    registrationNumber: {
      type: String,
      required: [true, "Registration number is required"],
      trim: true,
      uppercase: true,
      minlength: [3, "Registration number must be at least 3 characters"],
      maxlength: [40, "Registration number cannot exceed 40 characters"]
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
      maxlength: [80, "Department cannot exceed 80 characters"]
    },
    semester: {
      type: Number,
      required: [true, "Semester is required"],
      min: [1, "Semester must be at least 1"],
      max: [12, "Semester cannot exceed 12"]
    },
    session: {
      type: String,
      required: [true, "Session is required"],
      trim: true,
      maxlength: [30, "Session cannot exceed 30 characters"]
    },
    guardianName: {
      type: String,
      trim: true,
      maxlength: [100, "Guardian name cannot exceed 100 characters"]
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [25, "Phone cannot exceed 25 characters"]
    },
    address: {
      type: String,
      trim: true,
      maxlength: [250, "Address cannot exceed 250 characters"]
    }
  },
  {
    timestamps: true
  }
);

studentSchema.index({ registrationNumber: 1 }, { unique: true });
studentSchema.index({ userId: 1 }, { unique: true });
studentSchema.index({ department: 1 });
studentSchema.index({ semester: 1 });
studentSchema.index({ department: 1, semester: 1 });
studentSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Student", studentSchema);
