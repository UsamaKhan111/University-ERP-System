const asyncHandler = require("../../utils/asyncHandler");
const studentService = require("./student.service");

const listStudents = asyncHandler(async (req, res) => {
  const data = await studentService.listStudents(req.query);

  res.status(200).json({
    success: true,
    data
  });
});

const createStudent = asyncHandler(async (req, res) => {
  const student = await studentService.createStudent(req.body);

  res.status(201).json({
    success: true,
    message: "Student profile created successfully",
    data: {
      student
    }
  });
});

const getStudent = asyncHandler(async (req, res) => {
  const student = await studentService.getStudentById(req.params.id);

  studentService.assertStudentCanRead(req.user, student);

  res.status(200).json({
    success: true,
    data: {
      student
    }
  });
});

const getMyStudentProfile = asyncHandler(async (req, res) => {
  const student = await studentService.getStudentByUserId(req.user._id);

  res.status(200).json({
    success: true,
    data: {
      student
    }
  });
});

const updateStudent = asyncHandler(async (req, res) => {
  const student = await studentService.updateStudent(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "Student profile updated successfully",
    data: {
      student
    }
  });
});

const deleteStudent = asyncHandler(async (req, res) => {
  await studentService.deleteStudent(req.params.id);

  res.status(200).json({
    success: true,
    message: "Student profile deleted successfully"
  });
});

const getDepartmentStats = asyncHandler(async (_req, res) => {
  const departments = await studentService.getDepartmentWiseCounts();

  res.status(200).json({
    success: true,
    data: {
      departments
    }
  });
});

const getSemesterStats = asyncHandler(async (_req, res) => {
  const semesters = await studentService.getSemesterWiseCounts();

  res.status(200).json({
    success: true,
    data: {
      semesters
    }
  });
});

module.exports = {
  createStudent,
  deleteStudent,
  getDepartmentStats,
  getMyStudentProfile,
  getSemesterStats,
  getStudent,
  listStudents,
  updateStudent
};
