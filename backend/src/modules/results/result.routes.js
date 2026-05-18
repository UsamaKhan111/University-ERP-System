const express = require("express");

const { authorize, protect } = require("../../middleware/authMiddleware");
const validateRequest = require("../../middleware/validateRequest");
const resultController = require("./result.controller");
const { createResultSchema, studentResultsSchema } = require("./result.validators");

const router = express.Router();

router.get("/analytics/top-students", protect, authorize("admin", "teacher"), resultController.getTopStudents);
router.get("/analytics/average-gpa", protect, authorize("admin", "teacher"), resultController.getAverageGPA);
router.get(
  "/analytics/subject-performance",
  protect,
  authorize("admin", "teacher"),
  resultController.getSubjectWisePerformance
);

router.post("/", protect, authorize("admin", "teacher"), validateRequest(createResultSchema), resultController.createResult);
router.get(
  "/student/:id",
  protect,
  authorize("admin", "teacher", "student"),
  validateRequest(studentResultsSchema),
  resultController.getStudentResults
);

module.exports = router;
