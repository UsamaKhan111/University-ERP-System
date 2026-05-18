const jwt = require("jsonwebtoken");
const request = require("supertest");

jest.mock("../models/User", () => ({
  findById: jest.fn()
}));

jest.mock("../models/Teacher", () => ({
  countDocuments: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn()
}));

jest.mock("../models/Enrollment", () => ({
  find: jest.fn()
}));

const app = require("../app");
const Enrollment = require("../models/Enrollment");
const Teacher = require("../models/Teacher");
const User = require("../models/User");

const adminId = "64f100000000000000000001";
const teacherUserId = "64f100000000000000000002";
const studentUserId = "64f100000000000000000003";
const teacherId = "64f100000000000000000004";
const courseId = "64f100000000000000000005";

const users = {
  admin: { _id: adminId, fullName: "Admin User", email: "admin@example.com", role: "admin", isActive: true },
  teacher: { _id: teacherUserId, fullName: "Teacher User", email: "teacher@example.com", role: "teacher", isActive: true },
  student: { _id: studentUserId, fullName: "Student User", email: "student@example.com", role: "student", isActive: true }
};

const teacherProfile = {
  _id: teacherId,
  userId: users.teacher,
  employeeId: "TCH-001",
  department: "Computer Science",
  specialization: "Databases",
  assignedCourses: [courseId]
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

const buildEnrollmentQuery = (result) => {
  const chain = {};
  chain.populate = jest.fn(() => chain);
  chain.lean = jest.fn().mockResolvedValue(result);
  return chain;
};

const mockAuthenticatedUser = (authUser, linkedTeacherUser = users.teacher) => {
  User.findById.mockImplementation((id) => {
    if (String(id) === String(authUser._id)) {
      return {
        select: jest.fn().mockResolvedValue(authUser)
      };
    }

    return Promise.resolve(linkedTeacherUser);
  });
};

describe("Teacher routes", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "teacher-test-secret";
    jest.clearAllMocks();
  });

  it("lists teachers for admin users with pagination", async () => {
    mockAuthenticatedUser(users.admin);
    Teacher.find.mockReturnValue(buildManyQuery([teacherProfile]));
    Teacher.countDocuments.mockResolvedValue(1);

    const response = await request(app)
      .get("/api/teachers?search=database&page=1&limit=5")
      .set("Authorization", `Bearer ${makeToken(users.admin)}`);

    expect(response.status).toBe(200);
    expect(response.body.data.teachers).toHaveLength(1);
    expect(response.body.data.pagination).toMatchObject({ page: 1, limit: 5, total: 1 });
    expect(Teacher.find).toHaveBeenCalledWith(expect.objectContaining({ $or: expect.any(Array) }));
  });

  it("allows admins to create teacher profiles", async () => {
    mockAuthenticatedUser(users.admin);
    Teacher.findOne.mockResolvedValue(null);
    Teacher.create.mockResolvedValue({ _id: teacherId });
    Teacher.findById.mockReturnValue(buildOneQuery(teacherProfile));

    const response = await request(app)
      .post("/api/teachers")
      .set("Authorization", `Bearer ${makeToken(users.admin)}`)
      .send({
        userId: teacherUserId,
        employeeId: "tch-001",
        department: "Computer Science",
        specialization: "Databases",
        assignedCourses: [courseId]
      });

    expect(response.status).toBe(201);
    expect(response.body.data.teacher.employeeId).toBe("TCH-001");
    expect(Teacher.create).toHaveBeenCalledWith(
      expect.objectContaining({
        employeeId: "TCH-001",
        userId: teacherUserId
      })
    );
  });

  it("blocks non-admin teacher creation", async () => {
    mockAuthenticatedUser(users.teacher);

    const response = await request(app)
      .post("/api/teachers")
      .set("Authorization", `Bearer ${makeToken(users.teacher)}`)
      .send({
        userId: teacherUserId,
        employeeId: "TCH-001",
        department: "Computer Science",
        specialization: "Databases"
      });

    expect(response.status).toBe(403);
    expect(Teacher.create).not.toHaveBeenCalled();
  });

  it("returns the current teacher dashboard", async () => {
    mockAuthenticatedUser(users.teacher);
    Teacher.findOne.mockReturnValue(buildOneQuery(teacherProfile));
    Enrollment.find.mockReturnValue(buildEnrollmentQuery([]));

    const response = await request(app)
      .get("/api/teachers/dashboard")
      .set("Authorization", `Bearer ${makeToken(users.teacher)}`);

    expect(response.status).toBe(200);
    expect(response.body.data.teacher.employeeId).toBe("TCH-001");
    expect(response.body.data.totals).toMatchObject({
      activeStudents: 0,
      assignedCourses: 1
    });
    expect(response.body.data.rosters).toHaveLength(1);
    expect(Teacher.findOne).toHaveBeenCalledWith({ userId: teacherUserId });
  });

  it("blocks students from the teacher dashboard", async () => {
    mockAuthenticatedUser(users.student);

    const response = await request(app)
      .get("/api/teachers/dashboard")
      .set("Authorization", `Bearer ${makeToken(users.student)}`);

    expect(response.status).toBe(403);
    expect(Teacher.findOne).not.toHaveBeenCalled();
  });
});
