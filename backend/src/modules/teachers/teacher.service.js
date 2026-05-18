const Teacher = require("../../models/Teacher");
const Enrollment = require("../../models/Enrollment");
const User = require("../../models/User");
const ApiError = require("../../utils/apiError");
const getPagination = require("../../utils/pagination");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const teacherPopulate = {
  path: "userId",
  select: "fullName email role isActive"
};

const coursePopulate = {
  path: "assignedCourses",
  select: "title courseCode semester creditHours teacherId"
};

const buildTeacherFilter = (query) => {
  const filter = {};

  if (query.search) {
    const searchRegex = new RegExp(escapeRegex(query.search), "i");
    filter.$or = [{ employeeId: searchRegex }, { department: searchRegex }, { specialization: searchRegex }];
  }

  if (query.department) {
    filter.department = new RegExp(`^${escapeRegex(query.department)}$`, "i");
  }

  return filter;
};

const ensureTeacherUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "Teacher user account not found");
  }

  if (user.role !== "teacher") {
    throw new ApiError(400, "Linked user account must have the teacher role");
  }

  if (!user.isActive) {
    throw new ApiError(400, "Linked teacher user account is inactive");
  }

  return user;
};

const listTeachers = async (query) => {
  const { limit, page, skip } = getPagination(query);
  const filter = buildTeacherFilter(query);

  const [teachers, total] = await Promise.all([
    Teacher.find(filter).populate(teacherPopulate).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Teacher.countDocuments(filter)
  ]);

  return {
    pagination: {
      limit,
      page,
      total,
      totalPages: Math.ceil(total / limit) || 1
    },
    teachers
  };
};

const createTeacher = async (payload) => {
  await ensureTeacherUser(payload.userId);

  const existingTeacher = await Teacher.findOne({
    $or: [{ userId: payload.userId }, { employeeId: payload.employeeId }]
  });

  if (existingTeacher) {
    throw new ApiError(409, "Teacher profile or employee ID already exists");
  }

  const teacher = await Teacher.create(payload);

  return Teacher.findById(teacher._id).populate(teacherPopulate).lean();
};

const updateTeacher = async (teacherId, payload) => {
  const { fullName, password, ...teacherPayload } = payload;

  if (teacherPayload.userId) {
    await ensureTeacherUser(teacherPayload.userId);
  }

  if (teacherPayload.employeeId) {
    const duplicateEmployee = await Teacher.findOne({
      _id: { $ne: teacherId },
      employeeId: teacherPayload.employeeId
    });

    if (duplicateEmployee) {
      throw new ApiError(409, "Employee ID already exists");
    }
  }

  if (teacherPayload.userId) {
    const duplicateUser = await Teacher.findOne({
      _id: { $ne: teacherId },
      userId: teacherPayload.userId
    });

    if (duplicateUser) {
      throw new ApiError(409, "Teacher profile already exists for this user");
    }
  }

  const existing = await Teacher.findById(teacherId);

  if (!existing) {
    throw new ApiError(404, "Teacher profile not found");
  }

  if (fullName !== undefined || password !== undefined) {
    const linkedUserId = teacherPayload.userId || existing.userId;
    const linkedUser = await User.findById(linkedUserId).select("+password");
    if (!linkedUser) {
      throw new ApiError(404, "Linked user account not found");
    }
    if (fullName !== undefined) linkedUser.fullName = fullName;
    if (password !== undefined) linkedUser.password = password;
    await linkedUser.save();
  }

  if (Object.keys(teacherPayload).length > 0) {
    await Teacher.findByIdAndUpdate(teacherId, teacherPayload, {
      new: true,
      runValidators: true
    });
  }

  return Teacher.findById(teacherId).populate(teacherPopulate).lean();
};

const getDashboardForUser = async (userId) => {
  const teacher = await Teacher.findOne({ userId }).populate(teacherPopulate).populate(coursePopulate).lean();

  if (!teacher) {
    throw new ApiError(404, "Teacher profile not found for this user");
  }

  const assignedCourses = teacher.assignedCourses || [];
  const assignedCourseIds = assignedCourses.map((course) => course._id || course);
  const enrollments =
    assignedCourseIds.length > 0
      ? await Enrollment.find({ courseId: { $in: assignedCourseIds } })
          .populate({
            path: "studentId",
            populate: {
              path: "userId",
              select: "fullName email role isActive"
            }
          })
          .lean()
      : [];

  const rosters = assignedCourses.map((course) => ({
    course,
    students: enrollments
      .filter((enrollment) => String(enrollment.courseId) === String(course._id || course))
      .map((enrollment) => enrollment.studentId)
      .filter(Boolean)
  }));

  return {
    teacher,
    assignedCourses,
    rosters,
    totals: {
      assignedCourses: assignedCourses.length,
      activeStudents: enrollments.length
    }
  };
};

module.exports = {
  createTeacher,
  getDashboardForUser,
  listTeachers,
  updateTeacher
};
