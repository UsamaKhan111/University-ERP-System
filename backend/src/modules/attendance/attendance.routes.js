const express = require("express");

const { authorize, protect } = require("../../middleware/authMiddleware");
const validateRequest = require("../../middleware/validateRequest");
const attendanceController = require("./attendance.controller");
const {
  attendanceAnalyticsSchema,
  markAttendanceSchema,
  studentAttendanceSchema
} = require("./attendance.validators");

const router = express.Router();

router.get(
  "/analytics/monthly",
  protect,
  authorize("admin", "teacher"),
  validateRequest(attendanceAnalyticsSchema),
  attendanceController.getMonthlyAttendance
);
router.get(
  "/analytics/percentages",
  protect,
  authorize("admin", "teacher"),
  validateRequest(attendanceAnalyticsSchema),
  attendanceController.getAttendancePercentages
);
router.get(
  "/analytics/defaulters",
  protect,
  authorize("admin", "teacher"),
  validateRequest(attendanceAnalyticsSchema),
  attendanceController.getDefaulters
);

router.post("/", protect, authorize("admin", "teacher"), validateRequest(markAttendanceSchema), attendanceController.markAttendance);
router.get(
  "/student/:id",
  protect,
  authorize("admin", "teacher", "student"),
  validateRequest(studentAttendanceSchema),
  attendanceController.getStudentAttendance
);

module.exports = router;
