const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: [true, "Exam is required"]
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student is required"]
    },
    obtainedMarks: {
      type: Number,
      required: [true, "Obtained marks are required"],
      min: [0, "Obtained marks cannot be negative"]
    },
    grade: {
      type: String,
      required: [true, "Grade is required"],
      trim: true
    },
    GPA: {
      type: Number,
      required: [true, "GPA is required"],
      min: [0, "GPA cannot be negative"],
      max: [4, "GPA cannot exceed 4"]
    }
  },
  {
    timestamps: true
  }
);

resultSchema.index({ examId: 1, studentId: 1 }, { unique: true });
resultSchema.index({ studentId: 1 });
resultSchema.index({ GPA: -1 });

module.exports = mongoose.model("Result", resultSchema);
