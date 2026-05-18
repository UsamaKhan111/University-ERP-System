const Course = require("../../models/Course");
const Exam = require("../../models/Exam");
const Result = require("../../models/Result");
const Student = require("../../models/Student");
const Teacher = require("../../models/Teacher");
const ApiError = require("../../utils/apiError");

const resultPopulate = [
  {
    path: "examId",
    populate: {
      path: "courseId",
      select: "title courseCode semester creditHours teacherId"
    }
  },
  {
    path: "studentId",
    populate: {
      path: "userId",
      select: "fullName email role isActive"
    }
  }
];

const calculateGrade = (percentage) => {
  if (percentage >= 85) {
    return { GPA: 4, grade: "A" };
  }

  if (percentage >= 75) {
    return { GPA: 3.5, grade: "B+" };
  }

  if (percentage >= 65) {
    return { GPA: 3, grade: "B" };
  }

  if (percentage >= 55) {
    return { GPA: 2.5, grade: "C+" };
  }

  if (percentage >= 50) {
    return { GPA: 2, grade: "C" };
  }

  return { GPA: 0, grade: "F" };
};

const assertTeacherOwnsExamCourse = async (authUser, exam) => {
  if (authUser.role !== "teacher") {
    return;
  }

  const [teacher, course] = await Promise.all([
    Teacher.findOne({ userId: authUser._id }),
    Course.findById(exam.courseId)
  ]);

  if (!teacher || !course || String(course.teacherId) !== String(teacher._id)) {
    throw new ApiError(403, "Teachers can only enter marks for assigned courses");
  }
};

const createResult = async (payload, authUser) => {
  const [exam, student] = await Promise.all([
    Exam.findById(payload.examId),
    Student.findById(payload.studentId)
  ]);

  if (!exam) {
    throw new ApiError(404, "Exam not found");
  }

  if (!student) {
    throw new ApiError(404, "Student profile not found");
  }

  if (payload.obtainedMarks > exam.totalMarks) {
    throw new ApiError(400, "Obtained marks cannot exceed total marks");
  }

  await assertTeacherOwnsExamCourse(authUser, exam);

  const existingResult = await Result.findOne({
    examId: payload.examId,
    studentId: payload.studentId
  });

  if (existingResult) {
    throw new ApiError(409, "Result already exists for this student and exam");
  }

  const percentage = (payload.obtainedMarks / exam.totalMarks) * 100;
  const { GPA, grade } = calculateGrade(percentage);
  const result = await Result.create({
    ...payload,
    GPA,
    grade
  });

  return Result.findById(result._id).populate(resultPopulate).lean();
};

const assertStudentCanRead = (authUser, student) => {
  if (authUser.role !== "student") {
    return;
  }

  if (String(student.userId) !== String(authUser._id)) {
    throw new ApiError(403, "You can only view your own results");
  }
};

const getStudentResults = async (studentId, authUser) => {
  const student = await Student.findById(studentId);

  if (!student) {
    throw new ApiError(404, "Student profile not found");
  }

  assertStudentCanRead(authUser, student);

  return Result.find({ studentId }).populate(resultPopulate).sort({ createdAt: -1 }).lean();
};

const getTopStudents = async () => {
  return Result.aggregate([
    {
      $group: {
        _id: "$studentId",
        averageGPA: { $avg: "$GPA" },
        totalResults: { $sum: 1 }
      }
    },
    { $sort: { averageGPA: -1, totalResults: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "students",
        localField: "_id",
        foreignField: "_id",
        as: "student"
      }
    },
    { $unwind: "$student" },
    {
      $project: {
        _id: 0,
        studentId: "$_id",
        registrationNumber: "$student.registrationNumber",
        averageGPA: { $round: ["$averageGPA", 2] },
        totalResults: 1
      }
    }
  ]);
};

const getAverageGPA = async () => {
  return Result.aggregate([
    {
      $group: {
        _id: null,
        averageGPA: { $avg: "$GPA" },
        totalResults: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        averageGPA: { $round: ["$averageGPA", 2] },
        totalResults: 1
      }
    }
  ]);
};

const getSubjectWisePerformance = async () => {
  return Result.aggregate([
    {
      $lookup: {
        from: "exams",
        localField: "examId",
        foreignField: "_id",
        as: "exam"
      }
    },
    { $unwind: "$exam" },
    {
      $lookup: {
        from: "courses",
        localField: "exam.courseId",
        foreignField: "_id",
        as: "course"
      }
    },
    { $unwind: "$course" },
    {
      $group: {
        _id: "$course._id",
        courseCode: { $first: "$course.courseCode" },
        title: { $first: "$course.title" },
        averageGPA: { $avg: "$GPA" },
        averageMarks: { $avg: "$obtainedMarks" },
        totalResults: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        courseId: "$_id",
        courseCode: 1,
        title: 1,
        averageGPA: { $round: ["$averageGPA", 2] },
        averageMarks: { $round: ["$averageMarks", 2] },
        totalResults: 1
      }
    },
    { $sort: { averageGPA: -1, courseCode: 1 } }
  ]);
};

module.exports = {
  createResult,
  getAverageGPA,
  getStudentResults,
  getSubjectWisePerformance,
  getTopStudents
};
