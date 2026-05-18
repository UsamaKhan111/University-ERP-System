const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      minlength: [2, "Course title must be at least 2 characters"],
      maxlength: [120, "Course title cannot exceed 120 characters"]
    },
    courseCode: {
      type: String,
      required: [true, "Course code is required"],
      trim: true,
      uppercase: true,
      minlength: [2, "Course code must be at least 2 characters"],
      maxlength: [30, "Course code cannot exceed 30 characters"]
    },
    semester: {
      type: Number,
      required: [true, "Semester is required"],
      min: [1, "Semester must be at least 1"],
      max: [12, "Semester cannot exceed 12"]
    },
    creditHours: {
      type: Number,
      required: [true, "Credit hours are required"],
      min: [1, "Credit hours must be at least 1"],
      max: [6, "Credit hours cannot exceed 6"]
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: [true, "Teacher is required"]
    }
  },
  {
    timestamps: true
  }
);

courseSchema.index({ courseCode: 1 }, { unique: true });
courseSchema.index({ semester: 1 });
courseSchema.index({ teacherId: 1 });
courseSchema.index({ semester: 1, teacherId: 1 });
courseSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Course", courseSchema);
