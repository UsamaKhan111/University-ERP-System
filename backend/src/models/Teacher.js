const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Teacher user is required"]
    },
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      trim: true,
      uppercase: true,
      minlength: [3, "Employee ID must be at least 3 characters"],
      maxlength: [40, "Employee ID cannot exceed 40 characters"]
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
      maxlength: [80, "Department cannot exceed 80 characters"]
    },
    specialization: {
      type: String,
      required: [true, "Specialization is required"],
      trim: true,
      maxlength: [120, "Specialization cannot exceed 120 characters"]
    },
    assignedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
      }
    ]
  },
  {
    timestamps: true
  }
);

teacherSchema.index({ employeeId: 1 }, { unique: true });
teacherSchema.index({ userId: 1 }, { unique: true });
teacherSchema.index({ department: 1 });
teacherSchema.index({ department: 1, specialization: 1 });

module.exports = mongoose.model("Teacher", teacherSchema);
