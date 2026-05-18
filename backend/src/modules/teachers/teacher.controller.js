const asyncHandler = require("../../utils/asyncHandler");
const teacherService = require("./teacher.service");

const listTeachers = asyncHandler(async (req, res) => {
  const data = await teacherService.listTeachers(req.query);

  res.status(200).json({
    success: true,
    data
  });
});

const createTeacher = asyncHandler(async (req, res) => {
  const teacher = await teacherService.createTeacher(req.body);

  res.status(201).json({
    success: true,
    message: "Teacher profile created successfully",
    data: {
      teacher
    }
  });
});

const getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await teacherService.getDashboardForUser(req.user._id);

  res.status(200).json({
    success: true,
    data: dashboard
  });
});

module.exports = {
  createTeacher,
  getDashboard,
  listTeachers
};
