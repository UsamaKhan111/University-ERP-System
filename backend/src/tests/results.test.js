const jwt = require("jsonwebtoken");
const request = require("supertest");

jest.mock("../models/User", () => ({
  findById: jest.fn()
}));

jest.mock("../models/Course", () => ({
  findById: jest.fn()
}));

jest.mock("../models/Teacher", () => ({
  findOne: jest.fn()
}));

jest.mock("../models/Student", () => ({
  findById: jest.fn()
}));

jest.mock("../models/Exam", () => ({
  countDocuments: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn()
}));

jest.mock("../models/Result", () => ({
  aggregate: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn()
}));

const app = require("../app");
const Course = require("../models/Course");
const Exam = require("../models/Exam");
const Result = require("../models/Result");
const Student = require("../models/Student");
const User = require("../models/User");

const adminId = "64f400000000000000000001";
const studentUserId = "64f400000000000000000002";
const courseId = "64f400000000000000000003";
const examId = "64f400000000000000000004";
const studentId = "64f400000000000000000005";
const resultId = "64f400000000000000000006";

const users = {
  admin: { _id: adminId, fullName: "Admin User", email: "admin@example.com", role: "admin", isActive: true },
  student: { _id: studentUserId, fullName: "Student User", email: "student@example.com", role: "student", isActive: true }
};

const makeToken = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);

const buildOneQuery = (result) => {
  const chain = {};
  chain.populate = jest.fn(() => chain);
  chain.lean = jest.fn().mockResolvedValue(result);
  return chain;
};

const buildManyQuery = (result) => {
  const chain = {};
  chain.populate = jest.fn(() => chain);
  chain.sort = jest.fn(() => chain);
  chain.skip = jest.fn(() => chain);
  chain.limit = jest.fn(() => chain);
  chain.lean = jest.fn().mockResolvedValue(result);
  return chain;
};

const mockAuthenticatedUser = (authUser) => {
  User.findById.mockReturnValue({
    select: jest.fn().mockResolvedValue(authUser)
  });
};

describe("Exam and result routes", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "result-test-secret";
    jest.clearAllMocks();
  });

  it("schedules exams", async () => {
    mockAuthenticatedUser(users.admin);
    Course.findById.mockResolvedValue({ _id: courseId });
    Exam.create.mockResolvedValue({ _id: examId });
    Exam.findById.mockReturnValue(
      buildOneQuery({
        _id: examId,
        courseId,
        examType: "midterm",
        totalMarks: 50,
        examDate: "2026-06-01T00:00:00.000Z"
      })
    );

    const response = await request(app)
      .post("/api/exams")
      .set("Authorization", `Bearer ${makeToken(users.admin)}`)
      .send({
        courseId,
        examType: "midterm",
        totalMarks: 50,
        examDate: "2026-06-01"
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Exam scheduled successfully");
    expect(Exam.create).toHaveBeenCalledWith(
      expect.objectContaining({
        courseId,
        examType: "midterm",
        totalMarks: 50
      })
    );
  });

  it("lists exams with pagination", async () => {
    mockAuthenticatedUser(users.student);
    Exam.find.mockReturnValue(buildManyQuery([{ _id: examId, courseId, examType: "midterm", totalMarks: 50 }]));
    Exam.countDocuments.mockResolvedValue(1);

    const response = await request(app)
      .get("/api/exams?page=1&limit=5&examType=midterm")
      .set("Authorization", `Bearer ${makeToken(users.student)}`);

    expect(response.status).toBe(200);
    expect(response.body.data.exams).toHaveLength(1);
    expect(response.body.data.pagination).toMatchObject({ page: 1, limit: 5, total: 1 });
  });

  it("publishes results with calculated GPA and grade", async () => {
    mockAuthenticatedUser(users.admin);
    Exam.findById.mockResolvedValue({ _id: examId, courseId, totalMarks: 100 });
    Student.findById.mockResolvedValue({ _id: studentId, userId: studentUserId });
    Result.findOne.mockResolvedValue(null);
    Result.create.mockResolvedValue({ _id: resultId });
    Result.findById.mockReturnValue(
      buildOneQuery({
        _id: resultId,
        examId,
        studentId,
        obtainedMarks: 88,
        GPA: 4,
        grade: "A"
      })
    );

    const response = await request(app)
      .post("/api/results")
      .set("Authorization", `Bearer ${makeToken(users.admin)}`)
      .send({
        examId,
        studentId,
        obtainedMarks: 88
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Result published successfully");
    expect(Result.create).toHaveBeenCalledWith(
      expect.objectContaining({
        GPA: 4,
        grade: "A",
        obtainedMarks: 88
      })
    );
  });

  it("returns student results for the same student user", async () => {
    mockAuthenticatedUser(users.student);
    Student.findById.mockResolvedValue({ _id: studentId, userId: studentUserId });
    Result.find.mockReturnValue(buildManyQuery([{ _id: resultId, GPA: 4, grade: "A" }]));

    const response = await request(app)
      .get(`/api/results/student/${studentId}`)
      .set("Authorization", `Bearer ${makeToken(users.student)}`);

    expect(response.status).toBe(200);
    expect(response.body.data.results).toHaveLength(1);
  });

  it("returns top student aggregation", async () => {
    mockAuthenticatedUser(users.admin);
    Result.aggregate.mockResolvedValue([{ studentId, registrationNumber: "CS-001", averageGPA: 4, totalResults: 3 }]);

    const response = await request(app)
      .get("/api/results/analytics/top-students")
      .set("Authorization", `Bearer ${makeToken(users.admin)}`);

    expect(response.status).toBe(200);
    expect(response.body.data.students[0].averageGPA).toBe(4);
  });

  it("returns average GPA aggregation", async () => {
    mockAuthenticatedUser(users.admin);
    Result.aggregate.mockResolvedValue([{ averageGPA: 3.25, totalResults: 10 }]);

    const response = await request(app)
      .get("/api/results/analytics/average-gpa")
      .set("Authorization", `Bearer ${makeToken(users.admin)}`);

    expect(response.status).toBe(200);
    expect(response.body.data.summary.averageGPA).toBe(3.25);
  });

  it("returns subject-wise performance aggregation", async () => {
    mockAuthenticatedUser(users.admin);
    Result.aggregate.mockResolvedValue([
      { courseId, courseCode: "CS-301", title: "Database Systems", averageGPA: 3.5, averageMarks: 78, totalResults: 20 }
    ]);

    const response = await request(app)
      .get("/api/results/analytics/subject-performance")
      .set("Authorization", `Bearer ${makeToken(users.admin)}`);

    expect(response.status).toBe(200);
    expect(response.body.data.subjects[0].courseCode).toBe("CS-301");
  });
});
