const jwt = require("jsonwebtoken");
const request = require("supertest");

jest.mock("../models/User", () => ({
  findById: jest.fn()
}));

jest.mock("../models/Student", () => ({
  findById: jest.fn()
}));

jest.mock("../models/Fee", () => ({
  aggregate: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn()
}));

const app = require("../app");
const Fee = require("../models/Fee");
const Student = require("../models/Student");
const User = require("../models/User");

const adminId = "64f500000000000000000001";
const studentUserId = "64f500000000000000000002";
const otherStudentUserId = "64f500000000000000000003";
const studentId = "64f500000000000000000004";
const feeId = "64f500000000000000000005";

const users = {
  admin: { _id: adminId, fullName: "Admin User", email: "admin@example.com", role: "admin", isActive: true },
  student: { _id: studentUserId, fullName: "Student User", email: "student@example.com", role: "student", isActive: true },
  otherStudent: { _id: otherStudentUserId, fullName: "Other Student", email: "other@example.com", role: "student", isActive: true }
};

const feeRecord = {
  _id: feeId,
  studentId: {
    _id: studentId,
    userId: {
      _id: studentUserId,
      fullName: "Student User",
      email: "student@example.com"
    },
    registrationNumber: "CS-001"
  },
  semester: 4,
  amount: 45000,
  dueDate: "2026-06-15T00:00:00.000Z",
  paymentStatus: "pending"
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
  chain.lean = jest.fn().mockResolvedValue(result);
  return chain;
};

const mockAuthenticatedUser = (authUser) => {
  User.findById.mockReturnValue({
    select: jest.fn().mockResolvedValue(authUser)
  });
};

describe("Fee routes", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "fee-test-secret";
    jest.clearAllMocks();
  });

  it("allows admins to generate fees", async () => {
    mockAuthenticatedUser(users.admin);
    Student.findById.mockResolvedValue({ _id: studentId, userId: studentUserId });
    Fee.create.mockResolvedValue({ _id: feeId });
    Fee.findById.mockReturnValue(buildOneQuery(feeRecord));

    const response = await request(app)
      .post("/api/fees")
      .set("Authorization", `Bearer ${makeToken(users.admin)}`)
      .send({
        studentId,
        semester: 4,
        amount: 45000,
        dueDate: "2026-06-15",
        paymentStatus: "pending"
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Fee generated successfully");
    expect(Fee.create).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 45000,
        paymentStatus: "pending",
        semester: 4,
        studentId
      })
    );
  });

  it("returns a student's own fee records", async () => {
    mockAuthenticatedUser(users.student);
    Student.findById.mockResolvedValue({ _id: studentId, userId: studentUserId });
    Fee.find.mockReturnValue(buildManyQuery([feeRecord]));

    const response = await request(app)
      .get(`/api/fees/student/${studentId}`)
      .set("Authorization", `Bearer ${makeToken(users.student)}`);

    expect(response.status).toBe(200);
    expect(response.body.data.fees).toHaveLength(1);
  });

  it("blocks students from reading another student's fees", async () => {
    mockAuthenticatedUser(users.otherStudent);
    Student.findById.mockResolvedValue({ _id: studentId, userId: studentUserId });

    const response = await request(app)
      .get(`/api/fees/student/${studentId}`)
      .set("Authorization", `Bearer ${makeToken(users.otherStudent)}`);

    expect(response.status).toBe(403);
  });

  it("returns fee receipt data", async () => {
    mockAuthenticatedUser(users.student);
    Fee.findById.mockReturnValue(buildOneQuery(feeRecord));

    const response = await request(app)
      .get(`/api/fees/${feeId}/receipt`)
      .set("Authorization", `Bearer ${makeToken(users.student)}`);

    expect(response.status).toBe(200);
    expect(response.body.data.receipt.receiptNumber).toContain("FEE-");
  });

  it("returns due summary aggregation", async () => {
    mockAuthenticatedUser(users.admin);
    Fee.aggregate.mockResolvedValue([{ paymentStatus: "pending", totalAmount: 45000, totalRecords: 1 }]);

    const response = await request(app)
      .get("/api/fees/analytics/dues")
      .set("Authorization", `Bearer ${makeToken(users.admin)}`);

    expect(response.status).toBe(200);
    expect(response.body.data.summary[0].totalAmount).toBe(45000);
  });
});
