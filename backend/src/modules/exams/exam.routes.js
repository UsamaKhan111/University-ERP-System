const express = require("express");

const { authorize, protect } = require("../../middleware/authMiddleware");
const validateRequest = require("../../middleware/validateRequest");
const examController = require("./exam.controller");
const { createExamSchema, listExamsSchema } = require("./exam.validators");

const router = express.Router();

router
  .route("/")
  .get(protect, authorize("admin", "teacher", "student"), validateRequest(listExamsSchema), examController.listExams)
  .post(protect, authorize("admin", "teacher"), validateRequest(createExamSchema), examController.createExam);

module.exports = router;
