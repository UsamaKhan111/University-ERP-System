const Course = require("../../models/Course");
const Exam = require("../../models/Exam");
const Teacher = require("../../models/Teacher");
const ApiError = require("../../utils/apiError");
const getPagination = require("../../utils/pagination");

const examPopulate = {
  path: "courseId",
  select: "title courseCode semester creditHours teacherId"
};

const assertTeacherOwnsCourse = async (authUser, course) => {
  if (authUser.role !== "teacher") {
    return;
  }

  const teacher = await Teacher.findOne({ userId: authUser._id });

  if (!teacher || String(course.teacherId) !== String(teacher._id)) {
    throw new ApiError(403, "Teachers can only schedule exams for assigned courses");
  }
};

const createExam = async (payload, authUser) => {
  const course = await Course.findById(payload.courseId);

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  await assertTeacherOwnsCourse(authUser, course);

  const exam = await Exam.create(payload);

  return Exam.findById(exam._id).populate(examPopulate).lean();
};

const listExams = async (query) => {
  const { limit, page, skip } = getPagination(query);
  const filter = {
    ...(query.courseId ? { courseId: query.courseId } : {}),
    ...(query.examType ? { examType: query.examType } : {})
  };

  const [exams, total] = await Promise.all([
    Exam.find(filter).populate(examPopulate).sort({ examDate: -1 }).skip(skip).limit(limit).lean(),
    Exam.countDocuments(filter)
  ]);

  return {
    exams,
    pagination: {
      limit,
      page,
      total,
      totalPages: Math.ceil(total / limit) || 1
    }
  };
};

module.exports = {
  createExam,
  listExams
};
