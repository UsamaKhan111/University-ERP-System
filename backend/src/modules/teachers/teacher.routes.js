const express = require("express");

const { authorize, protect } = require("../../middleware/authMiddleware");
const validateRequest = require("../../middleware/validateRequest");
const teacherController = require("./teacher.controller");
const { createTeacherSchema, listTeachersSchema } = require("./teacher.validators");

const router = express.Router();

router.get("/dashboard", protect, authorize("teacher"), teacherController.getDashboard);

router
  .route("/")
  .get(protect, authorize("admin", "teacher"), validateRequest(listTeachersSchema), teacherController.listTeachers)
  .post(protect, authorize("admin"), validateRequest(createTeacherSchema), teacherController.createTeacher);

module.exports = router;
