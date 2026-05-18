const Course = require("../../models/Course");
const Enrollment = require("../../models/Enrollment");
const Teacher = require("../../models/Teacher");
const ApiError = require("../../utils/apiError");
const getPagination = require("../../utils/pagination");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const teacherPopulate = {
  path: "teacherId",
  populate: {
    path: "userId",
    select: "fullName email role isActive"
  }
};

const buildCourseFilter = (query) => {
  const filter = {};

  if (query.search) {
    const searchRegex = new RegExp(escapeRegex(query.search), "i");
    filter.$or = [{ title: searchRegex }, { courseCode: searchRegex }];
  }

  if (query.semester) {
    filter.semester = Number(query.semester);
  }

  if (query.teacherId) {
    filter.teacherId = query.teacherId;
  }

  return filter;
};

const listCourses = async (query) => {
  const { limit, page, skip } = getPagination(query);
  const filter = buildCourseFilter(query);

  const [courses, total] = await Promise.all([
    Course.find(filter).populate(teacherPopulate).sort({ semester: 1, courseCode: 1 }).skip(skip).limit(limit).lean(),
    Course.countDocuments(filter)
  ]);

  return {
    courses,
    pagination: {
      limit,
      page,
      total,
      totalPages: Math.ceil(total / limit) || 1
    }
  };
};

const createCourse = async (payload) => {
  const teacher = await Teacher.findById(payload.teacherId);

  if (!teacher) {
    throw new ApiError(404, "Teacher profile not found");
  }

  const existingCourse = await Course.findOne({ courseCode: payload.courseCode });

  if (existingCourse) {
    throw new ApiError(409, "Course code already exists");
  }

  const course = await Course.create(payload);

  await Teacher.findByIdAndUpdate(payload.teacherId, {
    $addToSet: { assignedCourses: course._id }
  });

  return Course.findById(course._id).populate(teacherPopulate).lean();
};

const getEnrollmentCountsByCourse = async () => {
  return Enrollment.aggregate([
    {
      $group: {
        _id: "$courseId",
        totalEnrolledStudents: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: "courses",
        localField: "_id",
        foreignField: "_id",
        as: "course"
      }
    },
    { $unwind: "$course" },
    {
      $project: {
        _id: 0,
        courseId: "$_id",
        courseCode: "$course.courseCode",
        title: "$course.title",
        totalEnrolledStudents: 1
      }
    },
    { $sort: { totalEnrolledStudents: -1, courseCode: 1 } }
  ]);
};

const getCourseCountsByTeacher = async () => {
  return Course.aggregate([
    {
      $group: {
        _id: "$teacherId",
        totalCourses: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: "teachers",
        localField: "_id",
        foreignField: "_id",
        as: "teacher"
      }
    },
    { $unwind: "$teacher" },
    {
      $lookup: {
        from: "users",
        localField: "teacher.userId",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        teacherId: "$_id",
        employeeId: "$teacher.employeeId",
        fullName: "$user.fullName",
        totalCourses: 1
      }
    },
    { $sort: { totalCourses: -1, employeeId: 1 } }
  ]);
};

module.exports = {
  createCourse,
  getCourseCountsByTeacher,
  getEnrollmentCountsByCourse,
  listCourses
};
