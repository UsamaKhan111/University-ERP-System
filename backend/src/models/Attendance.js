const mongoose = require("mongoose");

const attendanceStatuses = ["present", "absent", "leave"];

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student is required"]
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"]
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: [true, "Teacher is required"]
    },
    status: {
      type: String,
      enum: attendanceStatuses,
      required: [true, "Attendance status is required"]
    },
    lectureDate: {
      type: Date,
      required: [true, "Lecture date is required"]
    }
  },
  {
    timestamps: true
  }
);

attendanceSchema.index({ studentId: 1, lectureDate: -1 });
attendanceSchema.index({ courseId: 1, lectureDate: -1 });
attendanceSchema.index({ teacherId: 1, lectureDate: -1 });
attendanceSchema.index({ studentId: 1, courseId: 1, lectureDate: 1 }, { unique: true });

attendanceSchema.statics.statuses = attendanceStatuses;

module.exports = mongoose.model("Attendance", attendanceSchema);
