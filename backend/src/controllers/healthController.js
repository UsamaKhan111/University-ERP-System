const asyncHandler = require("../utils/asyncHandler");

const getApiStatus = asyncHandler(async (_req, res) => {
  res.status(200).json({
    success: true,
    message: "University ERP API Running"
  });
});

module.exports = {
  getApiStatus
};
