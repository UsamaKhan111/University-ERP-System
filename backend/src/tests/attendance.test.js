const jwt = require("jsonwebtoken");
const request = require("supertest");

jest.mock("../models/User", () => ({
  findById: jest.fn()
}));

jest.mock("../models/Student", () => ({
  findById: jest.fn()
}));

jest.mock("../models/Course", () => ({
  findById: jest.fn()
}));

jest.mock("../models/Teacher", () => ({
  findById: jest.fn(),
  findOne: jest.fn()
}));

jest.mock("../models/Attendance", () => ({
  aggregate: jest.fn(),
  countDocuments: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn()
}));

const app = require("../app");
const Attendance = require("../models/Attendance");
const Course = require("../models/Course");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const User = require("../models/User");

const adminId = "64f300000000000000000001";
const teacherUserId = "64f300000000000000000002";
const studentUserId = "64f300000000000000000003";
const studentId = "64f300000000000000000004";
const courseId = "64f300000000000000000005";
const teacherId = "64f300000000000000000006";
const attendanceId = "64f300000000000000000007";

const users = {
  admin: { _id: adminId, fullName: "Admin User", email: "admin@example.com", role: "admin", isActive: true },
  teacher: { _id: teacherUserId, fullName: "Teacher User", email: "teacher@example.com", role: "teacher", isActive: true },
  student: { _id: studentUserId, fullName: "Student User", email: "student@example.com", role: "student", isActive: true }
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

describe("Attendance routes", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "attendance-test-secret";
    jest.clearAllMocks();
  });

  it("allows admins to mark attendance", async () => {
    mockAuthenticatedUser(users.admin);
    Student.findById.mockResolvedValue({ _id: studentId, userId: studentUserId });
    Course.findById.mockResolvedValue({ _id: courseId });
    Teacher.findById.mockResolvedValue({ _id: teacherId });
    Attendance.findOne.mockResolvedValue(null);
    Attendance.create.mockResolvedValue({ _id: attendanceId });
    Attendance.findById.mockReturnValue(
      buildOneQuery({
        _id: attendanceId,
        studentId,
        courseId,
        teacherId,
        status: "present",
        lectureDate: "2026-05-17T00:00:00.000Z"
      })
    );

    const response = await request(app)
      .post("/api/attendance")
      .set("Authorization", `Bearer ${makeToken(users.admin)}`)
      .send({
        studentId,
        courseId,
        teacherId,
        status: "present",
        lectureDate: "2026-05-17"
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Attendance marked successfully");
    expect(Attendance.create).toHaveBeenCalledWith(
      expect.objectContaining({
        studentId,
        courseId,
        teacherId,
        status: "present",
        lectureDate: expect.any(Date)
      })
    );
  });

  it("blocks teachers from marking another teacher profile", async () => {
    mockAuthenticatedUser(users.teacher);
    Teacher.findOne.mockResolvedValue({ _id: "64f300000000000000000099" });

    const response = await request(app)
      .post("/api/attendance")
      .set("Authorization", `Bearer ${makeToken(users.teacher)}`)
      .send({
        studentId,
        courseId,
        teacherId,
        status: "present",
        lectureDate: "2026-05-17"
      });

    expect(response.status).toBe(403);
    expect(Attendance.create).not.toHaveBeenCalled();
  });

  it("returns student attendance history with pagination", async () => {
    mockAuthenticatedUser(users.student);
    Student.findById.mockResolvedValue({ _id: studentId, userId: studentUserId });
    Attendance.find.mockReturnValue(buildManyQuery([{ _id: attendanceId, status: "present" }]));
    Attendance.countDocuments.mockResolvedValue(1);

    const response = await request(app)
      .get(`/api/attendance/student/${studentId}?page=1&limit=5`)
      .set("Authorization", `Bearer ${makeToken(users.student)}`);

    expect(response.status).toBe(200);
    expect(response.body.data.records).toHaveLength(1);
    expect(response.body.data.pagination).toMatchObject({ page: 1, limit: 5, total: 1 });
  });

  it("returns monthly attendance aggregation", async () => {
    mockAuthenticatedUser(users.teacher);
    Attendance.aggregate.mockResolvedValue([
      { year: 2026, month: 5, statuses: [{ status: "present", total: 10 }], totalLectures: 10 }
    ]);

    const response = await request(app)
      .get("/api/attendance/analytics/monthly")
      .set("Authorization", `Bearer ${makeToken(users.teacher)}`);

    expect(response.status).toBe(200);
    expect(response.body.data.monthly[0].month).toBe(5);
    expect(Attendance.aggregate).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ $group: expect.any(Object) })]));
  });

  it("returns defaulter aggregation", async () => {
    mockAuthenticatedUser(users.admin);
    Attendance.aggregate.mockResolvedValue([
      { studentId, registrationNumber: "CS-001", totalLectures: 20, presentCount: 10, attendancePercentage: 50 }
    ]);

    const response = await request(app)
      .get("/api/attendance/analytics/defaulters?threshold=75")
      .set("Authorization", `Bearer ${makeToken(users.admin)}`);

    expect(response.status).toBe(200);
    expect(response.body.data.defaulters[0].attendancePercentage).toBe(50);
  });
});
