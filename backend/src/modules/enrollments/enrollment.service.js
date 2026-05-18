const Course = require("../../models/Course");
const Enrollment = require("../../models/Enrollment");
const Student = require("../../models/Student");
const ApiError = require("../../utils/apiError");

const enrollmentPopulate = [
  {
    path: "studentId",
    populate: {
      path: "userId",
      select: "fullName email role isActive"
    }
  },
  {
    path: "courseId",
    select: "title courseCode semester creditHours teacherId"
  }
];

const createEnrollment = async (payload) => {
  const [student, course] = await Promise.all([
    Student.findById(payload.studentId),
    Course.findById(payload.courseId)
  ]);

  if (!student) {
    throw new ApiError(404, "Student profile not found");
  }

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  const existingEnrollment = await Enrollment.findOne({
    studentId: payload.studentId,
    courseId: payload.courseId
  });

  if (existingEnrollment) {
    throw new ApiError(409, "Student is already enrolled in this course");
  }

  const enrollment = await Enrollment.create(payload);

  return Enrollment.findById(enrollment._id).populate(enrollmentPopulate).lean();
};

module.exports = {
  createEnrollment
};
