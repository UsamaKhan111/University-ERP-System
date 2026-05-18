const express = require("express");

const healthController = require("../controllers/healthController");
const attendanceRoutes = require("../modules/attendance/attendance.routes");
const analyticsRoutes = require("../modules/analytics/analytics.routes");
const authRoutes = require("../modules/auth/auth.routes");
const courseRoutes = require("../modules/courses/course.routes");
const enrollmentRoutes = require("../modules/enrollments/enrollment.routes");
const examRoutes = require("../modules/exams/exam.routes");
const feeRoutes = require("../modules/fees/fee.routes");
const resultRoutes = require("../modules/results/result.routes");
const studentRoutes = require("../modules/students/student.routes");
const teacherRoutes = require("../modules/teachers/teacher.routes");

const router = express.Router();

router.get("/", healthController.getApiStatus);
router.use("/api/attendance", attendanceRoutes);
router.use("/api/analytics", analyticsRoutes);
router.use("/api/auth", authRoutes);
router.use("/api/courses", courseRoutes);
router.use("/api/enrollments", enrollmentRoutes);
router.use("/api/exams", examRoutes);
router.use("/api/fees", feeRoutes);
router.use("/api/results", resultRoutes);
router.use("/api/students", studentRoutes);
router.use("/api/teachers", teacherRoutes);

module.exports = router;
