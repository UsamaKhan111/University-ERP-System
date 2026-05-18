const Fee = require("../../models/Fee");
const Student = require("../../models/Student");
const ApiError = require("../../utils/apiError");

const feePopulate = {
  path: "studentId",
  populate: {
    path: "userId",
    select: "fullName email role isActive"
  }
};

const assertStudentCanRead = (authUser, student) => {
  if (authUser.role !== "student") {
    return;
  }

  if (String(student.userId) !== String(authUser._id)) {
    throw new ApiError(403, "You can only view your own fee records");
  }
};

const createFee = async (payload) => {
  const student = await Student.findById(payload.studentId);

  if (!student) {
    throw new ApiError(404, "Student profile not found");
  }

  const fee = await Fee.create(payload);

  return Fee.findById(fee._id).populate(feePopulate).lean();
};

const getStudentFees = async (studentId, authUser) => {
  const student = await Student.findById(studentId);

  if (!student) {
    throw new ApiError(404, "Student profile not found");
  }

  assertStudentCanRead(authUser, student);

  return Fee.find({ studentId }).populate(feePopulate).sort({ dueDate: -1 }).lean();
};

const getReceipt = async (feeId, authUser) => {
  const fee = await Fee.findById(feeId).populate(feePopulate).lean();

  if (!fee) {
    throw new ApiError(404, "Fee record not found");
  }

  const student = fee.studentId;
  const studentUserId = student?.userId?._id || student?.userId;

  if (authUser.role === "student" && String(studentUserId) !== String(authUser._id)) {
    throw new ApiError(403, "You can only view your own fee receipts");
  }

  return {
    receiptNumber: `FEE-${String(fee._id).slice(-8).toUpperCase()}`,
    issuedAt: new Date(),
    fee
  };
};

const getDueSummary = async () => {
  return Fee.aggregate([
    {
      $group: {
        _id: "$paymentStatus",
        totalAmount: { $sum: "$amount" },
        totalRecords: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        paymentStatus: "$_id",
        totalAmount: 1,
        totalRecords: 1
      }
    },
    { $sort: { paymentStatus: 1 } }
  ]);
};

module.exports = {
  createFee,
  getDueSummary,
  getReceipt,
  getStudentFees
};
