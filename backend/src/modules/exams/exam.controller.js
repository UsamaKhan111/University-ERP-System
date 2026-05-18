const asyncHandler = require("../../utils/asyncHandler");
const examService = require("./exam.service");

const createExam = asyncHandler(async (req, res) => {
  const exam = await examService.createExam(req.body, req.user);

  res.status(201).json({
    success: true,
    message: "Exam scheduled successfully",
    data: {
      exam
    }
  });
});

const listExams = asyncHandler(async (req, res) => {
  const data = await examService.listExams(req.query);

  res.status(200).json({
    success: true,
    data
  });
});

module.exports = {
  createExam,
  listExams
};
