const jwt = require("jsonwebtoken");
const request = require("supertest");

jest.mock("../models/User", () => ({
  findById: jest.fn()
}));

jest.mock("../models/Teacher", () => ({
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn()
}));

jest.mock("../models/Student", () => ({
  findById: jest.fn()
}));

jest.mock("../models/Course", () => ({
  aggregate: jest.fn(),
  countDocuments: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn()
}));

jest.mock("../models/Enrollment", () => ({
  aggregate: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn()
}));

const app = require("../app");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const User = require("../models/User");

const adminId = "64f200000000000000000001";
const teacherUserId = "64f200000000000000000002";
const studentUserId = "64f200000000000000000003";
const teacherId = "64f200000000000000000004";
const studentId = "64f200000000000000000005";
const courseId = "64f200000000000000000006";
const enrollmentId = "64f200000000000000000007";

const users = {
  admin: { _id: adminId, fullName: "Admin User", email: "admin@example.com", role: "admin", isActive: true },
  teacher: { _id: teacherUserId, fullName: "Teacher User", email: "teacher@example.com", role: "teacher", isActive: true },
  student: { _id: studentUserId, fullName: "Student User", email: "student@example.com", role: "student", isActive: true }
};

const course = {
  _id: courseId,
  title: "Database Systems",
  courseCode: "CS-301",
  semester: 5,
  creditHours: 3,
  teacherId: {
    _id: teacherId,
    employeeId: "TCH-001",
    userId: users.teacher
  }
};

const makeToken = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);

const buildManyQuery = (result) => {
  const chain = {};
  chain.populate = jest.fn(() => chain);
  chain.sort = jest.fn(() => chain);
  chain.skip = jest.fn(() => chain);
  chain.limit = jest.fn(() => chain);
  chain.lean = jest.fn().mockResolvedValue(result);
  return chain;
};

const buildOneQuery = (result) => {
  const chain = {};
  chain.populate = jest.fn(() => chain);
  chain.lean = jest.fn().mockResolvedValue(result);
  return chain;
};

const mockAuthenticatedUser = (authUser) => {
  User.findById.mockReturnValue({
    select: jest.fn().mockResolvedValue(authUser)
  });
};

describe("Course and enrollment routes", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "course-test-secret";
    jest.clearAllMocks();
  });

  it("lists courses with filters and pagination", async () => {
    mockAuthenticatedUser(users.teacher);
    Course.find.mockReturnValue(buildManyQuery([course]));
    Course.countDocuments.mockResolvedValue(1);

    const response = await request(app)
      .get("/api/courses?search=database&semester=5&page=1&limit=5")
      .set("Authorization", `Bearer ${makeToken(users.teacher)}`);

    expect(response.status).toBe(200);
    expect(response.body.data.courses).toHaveLength(1);
    expect(response.body.data.pagination).toMatchObject({ page: 1, limit: 5, total: 1 });
    expect(Course.find).toHaveBeenCalledWith(expect.objectContaining({ $or: expect.any(Array), semester: 5 }));
  });

  it("allows admins to create courses and sync teacher assignments", async () => {
    mockAuthenticatedUser(users.admin);
    Teacher.findById.mockResolvedValue({ _id: teacherId });
    Course.findOne.mockResolvedValue(null);
    Course.create.mockResolvedValue({ _id: courseId });
    Teacher.findByIdAndUpdate.mockResolvedValue({});
    Course.findById.mockReturnValue(buildOneQuery(course));

    const response = await request(app)
      .post("/api/courses")
      .set("Authorization", `Bearer ${makeToken(users.admin)}`)
      .send({
        title: "Database Systems",
        courseCode: "cs-301",
        semester: 5,
        creditHours: 3,
        teacherId
      });

    expect(response.status).toBe(201);
    expect(response.body.data.course.courseCode).toBe("CS-301");
    expect(Course.create).toHaveBeenCalledWith(
      expect.objectContaining({
        courseCode: "CS-301",
        teacherId
      })
    );
    expect(Teacher.findByIdAndUpdate).toHaveBeenCalledWith(teacherId, {
      $addToSet: { assignedCourses: courseId }
    });
  });

  it("enrolls students in courses", async () => {
    mockAuthenticatedUser(users.admin);
    Student.findById.mockResolvedValue({ _id: studentId });
    Course.findById.mockResolvedValue({ _id: courseId });
    Enrollment.findOne.mockResolvedValue(null);
    Enrollment.create.mockResolvedValue({ _id: enrollmentId });
    Enrollment.findById.mockReturnValue(
      buildOneQuery({
        _id: enrollmentId,
        studentId,
        courseId
      })
    );

    const response = await request(app)
      .post("/api/enrollments")
      .set("Authorization", `Bearer ${makeToken(users.admin)}`)
      .send({
        studentId,
        courseId
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Student enrolled successfully");
    expect(Enrollment.create).toHaveBeenCalledWith({ studentId, courseId });
  });

  it("returns course enrollment aggregation", async () => {
    mockAuthenticatedUser(users.admin);
    Enrollment.aggregate.mockResolvedValue([
      { courseId, courseCode: "CS-301", title: "Database Systems", totalEnrolledStudents: 12 }
    ]);

    const response = await request(app)
      .get("/api/courses/analytics/enrollments")
      .set("Authorization", `Bearer ${makeToken(users.admin)}`);

    expect(response.status).toBe(200);
    expect(response.body.data.courses[0].totalEnrolledStudents).toBe(12);
    expect(Enrollment.aggregate).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ $group: expect.any(Object) })]));
  });

  it("returns course count per teacher aggregation", async () => {
    mockAuthenticatedUser(users.teacher);
    Course.aggregate.mockResolvedValue([{ teacherId, employeeId: "TCH-001", fullName: "Teacher User", totalCourses: 2 }]);

    const response = await request(app)
      .get("/api/courses/analytics/teachers")
      .set("Authorization", `Bearer ${makeToken(users.teacher)}`);

    expect(response.status).toBe(200);
    expect(response.body.data.teachers[0].totalCourses).toBe(2);
    expect(Course.aggregate).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ $group: expect.any(Object) })]));
  });
});
