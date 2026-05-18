const asyncHandler = require("../../utils/asyncHandler");
const attendanceService = require("./attendance.service");

const markAttendance = asyncHandler(async (req, res) => {
  const attendance = await attendanceService.markAttendance(req.body, req.user);

  res.status(201).json({
    success: true,
    message: "Attendance marked successfully",
    data: {
      attendance
    }
  });
});

const getStudentAttendance = asyncHandler(async (req, res) => {
  const data = await attendanceService.getStudentAttendance(req.params.id, req.query, req.user);

  res.status(200).json({
    success: true,
    data
  });
});

const getMonthlyAttendance = asyncHandler(async (req, res) => {
  const monthly = await attendanceService.getMonthlyAttendance(req.query);

  res.status(200).json({
    success: true,
    data: {
      monthly
    }
  });
});

const getAttendancePercentages = asyncHandler(async (req, res) => {
  const percentages = await attendanceService.getAttendancePercentages(req.query);

  res.status(200).json({
    success: true,
    data: {
      percentages
    }
  });
});

const getDefaulters = asyncHandler(async (req, res) => {
  const defaulters = await attendanceService.getDefaulters(req.query);

  res.status(200).json({
    success: true,
    data: {
      defaulters
    }
  });
});

module.exports = {
  getAttendancePercentages,
  getDefaulters,
  getMonthlyAttendance,
  getStudentAttendance,
  markAttendance
};
