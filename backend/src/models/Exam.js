const mongoose = require("mongoose");

const examTypes = ["quiz", "midterm", "final", "assignment", "lab"];

const examSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"]
    },
    examType: {
      type: String,
      enum: examTypes,
      required: [true, "Exam type is required"]
    },
    totalMarks: {
      type: Number,
      required: [true, "Total marks are required"],
      min: [1, "Total marks must be at least 1"],
      max: [1000, "Total marks cannot exceed 1000"]
    },
    examDate: {
      type: Date,
      required: [true, "Exam date is required"]
    }
  },
  {
    timestamps: true
  }
);

examSchema.index({ courseId: 1, examDate: -1 });
examSchema.index({ examType: 1 });

examSchema.statics.types = examTypes;

module.exports = mongoose.model("Exam", examSchema);
