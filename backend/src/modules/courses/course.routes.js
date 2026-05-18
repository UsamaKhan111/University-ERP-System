const express = require("express");

const { authorize, protect } = require("../../middleware/authMiddleware");
const validateRequest = require("../../middleware/validateRequest");
const courseController = require("./course.controller");
const { createCourseSchema, listCoursesSchema } = require("./course.validators");

const router = express.Router();

router.get("/analytics/enrollments", protect, authorize("admin", "teacher"), courseController.getEnrollmentStats);
router.get("/analytics/teachers", protect, authorize("admin", "teacher"), courseController.getTeacherStats);

router
  .route("/")
  .get(protect, authorize("admin", "teacher", "student"), validateRequest(listCoursesSchema), courseController.listCourses)
  .post(protect, authorize("admin"), validateRequest(createCourseSchema), courseController.createCourse);

module.exports = router;
