const jwt = require("jsonwebtoken");
const request = require("supertest");

jest.mock("../models/User", () => ({
  findById: jest.fn()
}));

jest.mock("../models/Student", () => ({
  aggregate: jest.fn()
}));

jest.mock("../models/Attendance", () => ({
  aggregate: jest.fn()
}));

jest.mock("../models/Fee", () => ({
  aggregate: jest.fn()
}));

jest.mock("../models/Result", () => ({
  aggregate: jest.fn()
}));

const app = require("../app");
const Attendance = require("../models/Attendance");
const Fee = require("../models/Fee");
const Result = require("../models/Result");
const Student = require("../models/Student");
const User = require("../models/User");

const admin = {
  _id: "64f600000000000000000001",
  fullName: "Admin User",
  email: "admin@example.com",
  role: "admin",
  isActive: true
};

const teacher = {
  _id: "64f600000000000000000002",
  fullName: "Teacher User",
  email: "teacher@example.com",
  role: "teacher",
  isActive: true
};

const makeToken = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);

const mockAuthenticatedUser = (authUser) => {
  User.findById.mockReturnValue({
    select: jest.fn().mockResolvedValue(authUser)
  });
};

describe("Analytics routes", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "analytics-test-secret";
    jest.clearAllMocks();
  });

  it("returns dashboard analytics for admins", async () => {
    mockAuthenticatedUser(admin);
    Student.aggregate.mockResolvedValueOnce([{ department: "Computer Science", totalStudents: 5 }]);
    Student.aggregate.mockResolvedValueOnce([{ year: 2026, month: 5, totalStudents: 5 }]);
    Attendance.aggregate.mockResolvedValue([{ year: 2026, month: 5, totalMarked: 10, statuses: [] }]);
    Fee.aggregate.mockResolvedValue([{ paymentStatus: "paid", totalAmount: 100000, totalRecords: 2 }]);
    Result.aggregate.mockResolvedValue([{ grade: "A", averageGPA: 4, totalResults: 3 }]);

    const response = await request(app)
      .get("/api/analytics/dashboard")
      .set("Authorization", `Bearer ${makeToken(admin)}`);

    expect(response.status).toBe(200);
    expect(response.body.data.departments).toHaveLength(1);
    expect(response.body.data.attendanceTrends).toHaveLength(1);
    expect(response.body.data.revenue[0].totalAmount).toBe(100000);
    expect(Student.aggregate).toHaveBeenCalledTimes(2);
    expect(Attendance.aggregate).toHaveBeenCalledTimes(1);
    expect(Fee.aggregate).toHaveBeenCalledTimes(1);
    expect(Result.aggregate).toHaveBeenCalledTimes(1);
  });

  it("blocks non-admin users", async () => {
    mockAuthenticatedUser(teacher);

    const response = await request(app)
      .get("/api/analytics/dashboard")
      .set("Authorization", `Bearer ${makeToken(teacher)}`);

    expect(response.status).toBe(403);
    expect(Student.aggregate).not.toHaveBeenCalled();
  });
});
