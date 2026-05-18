const asyncHandler = require("../../utils/asyncHandler");
const resultService = require("./result.service");

const createResult = asyncHandler(async (req, res) => {
  const result = await resultService.createResult(req.body, req.user);

  res.status(201).json({
    success: true,
    message: "Result published successfully",
    data: {
      result
    }
  });
});

const getStudentResults = asyncHandler(async (req, res) => {
  const results = await resultService.getStudentResults(req.params.id, req.user);

  res.status(200).json({
    success: true,
    data: {
      results
    }
  });
});

const getTopStudents = asyncHandler(async (_req, res) => {
  const students = await resultService.getTopStudents();

  res.status(200).json({
    success: true,
    data: {
      students
    }
  });
});

const getAverageGPA = asyncHandler(async (_req, res) => {
  const summary = await resultService.getAverageGPA();

  res.status(200).json({
    success: true,
    data: {
      summary: summary[0] || { averageGPA: 0, totalResults: 0 }
    }
  });
});

const getSubjectWisePerformance = asyncHandler(async (_req, res) => {
  const subjects = await resultService.getSubjectWisePerformance();

  res.status(200).json({
    success: true,
    data: {
      subjects
    }
  });
});

module.exports = {
  createResult,
  getAverageGPA,
  getStudentResults,
  getSubjectWisePerformance,
  getTopStudents
};
