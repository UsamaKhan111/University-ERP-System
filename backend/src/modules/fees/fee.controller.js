const asyncHandler = require("../../utils/asyncHandler");
const feeService = require("./fee.service");

const createFee = asyncHandler(async (req, res) => {
  const fee = await feeService.createFee(req.body);

  res.status(201).json({
    success: true,
    message: "Fee generated successfully",
    data: {
      fee
    }
  });
});

const getStudentFees = asyncHandler(async (req, res) => {
  const fees = await feeService.getStudentFees(req.params.id, req.user);

  res.status(200).json({
    success: true,
    data: {
      fees
    }
  });
});

const getReceipt = asyncHandler(async (req, res) => {
  const receipt = await feeService.getReceipt(req.params.id, req.user);

  res.status(200).json({
    success: true,
    data: {
      receipt
    }
  });
});

const getDueSummary = asyncHandler(async (_req, res) => {
  const summary = await feeService.getDueSummary();

  res.status(200).json({
    success: true,
    data: {
      summary
    }
  });
});

module.exports = {
  createFee,
  getDueSummary,
  getReceipt,
  getStudentFees
};
