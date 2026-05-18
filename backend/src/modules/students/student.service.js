const Student = require("../../models/Student");
const User = require("../../models/User");
const ApiError = require("../../utils/apiError");
const getPagination = require("../../utils/pagination");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const studentPopulate = {
  path: "userId",
  select: "fullName email role isActive"
};

const buildStudentFilter = (query) => {
  const filter = {};

  if (query.search) {
    const searchRegex = new RegExp(escapeRegex(query.search), "i");
    filter.$or = [
      { registrationNumber: searchRegex },
      { department: searchRegex },
      { session: searchRegex },
      { guardianName: searchRegex },
      { phone: searchRegex }
    ];
  }

  if (query.department) {
    filter.department = new RegExp(`^${escapeRegex(query.department)}$`, "i");
  }

  if (query.semester) {
    filter.semester = Number(query.semester);
  }

  return filter;
};

const ensureStudentUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "Student user account not found");
  }

  if (user.role !== "student") {
    throw new ApiError(400, "Linked user account must have the student role");
  }

  if (!user.isActive) {
    throw new ApiError(400, "Linked student user account is inactive");
  }

  return user;
};

const listStudents = async (query) => {
  const { limit, page, skip } = getPagination(query);
  const filter = buildStudentFilter(query);

  const [students, total] = await Promise.all([
    Student.find(filter).populate(studentPopulate).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Student.countDocuments(filter)
  ]);

  return {
    pagination: {
      limit,
      page,
      total,
      totalPages: Math.ceil(total / limit) || 1
    },
    students
  };
};

const getStudentById = async (studentId) => {
  const student = await Student.findById(studentId).populate(studentPopulate).lean();

  if (!student) {
    throw new ApiError(404, "Student profile not found");
  }

  return student;
};

const getStudentByUserId = async (userId) => {
  const student = await Student.findOne({ userId }).populate(studentPopulate).lean();

  if (!student) {
    throw new ApiError(404, "Student profile not found for this user");
  }

  return student;
};

const assertStudentCanRead = (authUser, student) => {
  if (authUser.role !== "student") {
    return;
  }

  const studentUserId = String(student.userId?._id || student.userId);

  if (studentUserId !== String(authUser._id)) {
    throw new ApiError(403, "You can only view your own student profile");
  }
};

const createStudent = async (payload) => {
  await ensureStudentUser(payload.userId);

  const existingStudent = await Student.findOne({
    $or: [{ userId: payload.userId }, { registrationNumber: payload.registrationNumber }]
  });

  if (existingStudent) {
    throw new ApiError(409, "Student profile or registration number already exists");
  }

  const student = await Student.create(payload);

  return getStudentById(student._id);
};

const updateStudent = async (studentId, payload) => {
  if (payload.userId) {
    await ensureStudentUser(payload.userId);
  }

  if (payload.registrationNumber) {
    const duplicateRegistration = await Student.findOne({
      _id: { $ne: studentId },
      registrationNumber: payload.registrationNumber
    });

    if (duplicateRegistration) {
      throw new ApiError(409, "Registration number already exists");
    }
  }

  if (payload.userId) {
    const duplicateUser = await Student.findOne({
      _id: { $ne: studentId },
      userId: payload.userId
    });

    if (duplicateUser) {
      throw new ApiError(409, "Student profile already exists for this user");
    }
  }

  const student = await Student.findByIdAndUpdate(studentId, payload, {
    new: true,
    runValidators: true
  })
    .populate(studentPopulate)
    .lean();

  if (!student) {
    throw new ApiError(404, "Student profile not found");
  }

  return student;
};

const deleteStudent = async (studentId) => {
  const student = await Student.findByIdAndDelete(studentId).lean();

  if (!student) {
    throw new ApiError(404, "Student profile not found");
  }

  return student;
};

const getDepartmentWiseCounts = async () => {
  return Student.aggregate([
    {
      $group: {
        _id: "$department",
        totalStudents: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        department: "$_id",
        totalStudents: 1
      }
    },
    { $sort: { totalStudents: -1, department: 1 } }
  ]);
};

const getSemesterWiseCounts = async () => {
  return Student.aggregate([
    {
      $group: {
        _id: "$semester",
        totalStudents: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        semester: "$_id",
        totalStudents: 1
      }
    },
    { $sort: { semester: 1 } }
  ]);
};

module.exports = {
  assertStudentCanRead,
  createStudent,
  deleteStudent,
  getDepartmentWiseCounts,
  getSemesterWiseCounts,
  getStudentById,
  getStudentByUserId,
  listStudents,
  updateStudent
};
