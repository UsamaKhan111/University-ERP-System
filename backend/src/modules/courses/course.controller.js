const asyncHandler = require("../../utils/asyncHandler");
const courseService = require("./course.service");

const listCourses = asyncHandler(async (req, res) => {
  const data = await courseService.listCourses(req.query);

  res.status(200).json({
    success: true,
    data
  });
});

const createCourse = asyncHandler(async (req, res) => {
  const course = await courseService.createCourse(req.body);

  res.status(201).json({
    success: true,
    message: "Course created successfully",
    data: {
      course
    }
  });
});

const getEnrollmentStats = asyncHandler(async (_req, res) => {
  const courses = await courseService.getEnrollmentCountsByCourse();

  res.status(200).json({
    success: true,
    data: {
      courses
    }
  });
});

const getTeacherStats = asyncHandler(async (_req, res) => {
  const teachers = await courseService.getCourseCountsByTeacher();

  res.status(200).json({
    success: true,
    data: {
      teachers
    }
  });
});

module.exports = {
  createCourse,
  getEnrollmentStats,
  getTeacherStats,
  listCourses
};
