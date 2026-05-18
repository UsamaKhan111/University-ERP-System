const Attendance = require("../../models/Attendance");
const Course = require("../../models/Course");
const Student = require("../../models/Student");
const Teacher = require("../../models/Teacher");
const ApiError = require("../../utils/apiError");
const getPagination = require("../../utils/pagination");
const mongoose = require("mongoose");

const attendancePopulate = [
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
  },
  {
    path: "teacherId",
    populate: {
      path: "userId",
      select: "fullName email role isActive"
    }
  }
];

const normalizeLectureDate = (date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const buildMatchFilter = (query) => {
  const match = {};

  if (query.courseId) {
    match.courseId = new mongoose.Types.ObjectId(query.courseId);
  }

  if (query.studentId) {
    match.studentId = new mongoose.Types.ObjectId(query.studentId);
  }

  return match;
};

const assertTeacherCanMark = async (authUser, teacherId) => {
  if (authUser.role !== "teacher") {
    return;
  }

  const teacher = await Teacher.findOne({ userId: authUser._id });

  if (!teacher || String(teacher._id) !== String(teacherId)) {
    throw new ApiError(403, "Teachers can only mark attendance for their own profile");
  }
};

const markAttendance = async (payload, authUser) => {
  const lectureDate = normalizeLectureDate(payload.lectureDate);

  await assertTeacherCanMark(authUser, payload.teacherId);

  const [student, course, teacher] = await Promise.all([
    Student.findById(payload.studentId),
    Course.findById(payload.courseId),
    Teacher.findById(payload.teacherId)
  ]);

  if (!student) {
    throw new ApiError(404, "Student profile not found");
  }

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  if (!teacher) {
    throw new ApiError(404, "Teacher profile not found");
  }

  const existingAttendance = await Attendance.findOne({
    studentId: payload.studentId,
    courseId: payload.courseId,
    lectureDate
  });

  if (existingAttendance) {
    throw new ApiError(409, "Attendance is already marked for this student, course, and date");
  }

  const attendance = await Attendance.create({
    ...payload,
    lectureDate
  });

  return Attendance.findById(attendance._id).populate(attendancePopulate).lean();
};

const assertStudentCanRead = (authUser, student) => {
  if (authUser.role !== "student") {
    return;
  }

  if (String(student.userId) !== String(authUser._id)) {
    throw new ApiError(403, "You can only view your own attendance");
  }
};

const getStudentAttendance = async (studentId, query, authUser) => {
  const student = await Student.findById(studentId);

  if (!student) {
    throw new ApiError(404, "Student profile not found");
  }

  assertStudentCanRead(authUser, student);

  const { limit, page, skip } = getPagination(query);
  const filter = {
    studentId,
    ...(query.courseId ? { courseId: query.courseId } : {})
  };

  const [records, total] = await Promise.all([
    Attendance.find(filter).populate(attendancePopulate).sort({ lectureDate: -1 }).skip(skip).limit(limit).lean(),
    Attendance.countDocuments(filter)
  ]);

  return {
    pagination: {
      limit,
      page,
      total,
      totalPages: Math.ceil(total / limit) || 1
    },
    records
  };
};

const getMonthlyAttendance = async (query) => {
  const match = buildMatchFilter(query);

  return Attendance.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          year: { $year: "$lectureDate" },
          month: { $month: "$lectureDate" },
          status: "$status"
        },
        total: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: {
          year: "$_id.year",
          month: "$_id.month"
        },
        statuses: {
          $push: {
            status: "$_id.status",
            total: "$total"
          }
        },
        totalLectures: { $sum: "$total" }
      }
    },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        month: "$_id.month",
        statuses: 1,
        totalLectures: 1
      }
    },
    { $sort: { year: 1, month: 1 } }
  ]);
};

const getAttendancePercentages = async (query) => {
  const match = buildMatchFilter(query);

  return Attendance.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$studentId",
        totalLectures: { $sum: 1 },
        presentCount: {
          $sum: {
            $cond: [{ $eq: ["$status", "present"] }, 1, 0]
          }
        }
      }
    },
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
        totalLectures: 1,
        presentCount: 1,
        attendancePercentage: {
          $round: [{ $multiply: [{ $divide: ["$presentCount", "$totalLectures"] }, 100] }, 2]
        }
      }
    },
    { $sort: { attendancePercentage: 1, registrationNumber: 1 } }
  ]);
};

const getDefaulters = async (query) => {
  const threshold = Number(query.threshold || 75);

  return Attendance.aggregate([
    { $match: buildMatchFilter(query) },
    {
      $group: {
        _id: "$studentId",
        totalLectures: { $sum: 1 },
        presentCount: {
          $sum: {
            $cond: [{ $eq: ["$status", "present"] }, 1, 0]
          }
        }
      }
    },
    {
      $addFields: {
        attendancePercentage: {
          $round: [{ $multiply: [{ $divide: ["$presentCount", "$totalLectures"] }, 100] }, 2]
        }
      }
    },
    {
      $match: {
        attendancePercentage: { $lt: threshold }
      }
    },
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
        totalLectures: 1,
        presentCount: 1,
        attendancePercentage: 1
      }
    },
    { $sort: { attendancePercentage: 1, registrationNumber: 1 } }
  ]);
};

module.exports = {
  getAttendancePercentages,
  getDefaulters,
  getMonthlyAttendance,
  getStudentAttendance,
  markAttendance
};
