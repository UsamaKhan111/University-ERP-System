const asyncHandler = require("../../utils/asyncHandler");
const enrollmentService = require("./enrollment.service");

const createEnrollment = asyncHandler(async (req, res) => {
  const enrollment = await enrollmentService.createEnrollment(req.body);

  res.status(201).json({
    success: true,
    message: "Student enrolled successfully",
    data: {
      enrollment
    }
  });
});

module.exports = {
  createEnrollment
};
