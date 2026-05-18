const express = require("express");

const { authorize, protect } = require("../../middleware/authMiddleware");
const validateRequest = require("../../middleware/validateRequest");
const studentController = require("./student.controller");
const {
  createStudentSchema,
  listStudentsSchema,
  studentIdSchema,
  updateStudentSchema
} = require("./student.validators");

const router = express.Router();

router.get(
  "/analytics/departments",
  protect,
  authorize("admin", "teacher"),
  studentController.getDepartmentStats
);
router.get(
  "/analytics/semesters",
  protect,
  authorize("admin", "teacher"),
  studentController.getSemesterStats
);
router.get("/me", protect, authorize("student"), studentController.getMyStudentProfile);

router
  .route("/")
  .get(protect, authorize("admin", "teacher"), validateRequest(listStudentsSchema), studentController.listStudents)
  .post(protect, authorize("admin"), validateRequest(createStudentSchema), studentController.createStudent);

router
  .route("/:id")
  .get(
    protect,
    authorize("admin", "teacher", "student"),
    validateRequest(studentIdSchema),
    studentController.getStudent
  )
  .put(protect, authorize("admin"), validateRequest(updateStudentSchema), studentController.updateStudent)
  .delete(protect, authorize("admin"), validateRequest(studentIdSchema), studentController.deleteStudent);

module.exports = router;
