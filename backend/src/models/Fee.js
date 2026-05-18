const mongoose = require("mongoose");

const paymentStatuses = ["pending", "paid", "overdue", "waived"];

const feeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student is required"]
    },
    semester: {
      type: Number,
      required: [true, "Semester is required"],
      min: [1, "Semester must be at least 1"],
      max: [12, "Semester cannot exceed 12"]
    },
    amount: {
      type: Number,
      required: [true, "Fee amount is required"],
      min: [0, "Fee amount cannot be negative"]
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"]
    },
    paymentStatus: {
      type: String,
      enum: paymentStatuses,
      default: "pending",
      required: true
    }
  },
  {
    timestamps: true
  }
);

feeSchema.index({ studentId: 1 });
feeSchema.index({ paymentStatus: 1, dueDate: 1 });
feeSchema.index({ semester: 1, paymentStatus: 1 });

feeSchema.statics.paymentStatuses = paymentStatuses;

module.exports = mongoose.model("Fee", feeSchema);
