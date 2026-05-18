const request = require("supertest"); // Re-introduced jsonwebtoken for test token generation

jest.mock("../models/User", () => ({
  findById: jest.fn()
}));

jest.mock("../models/Student", () => ({
  aggregate: jest.fn(),
  countDocuments: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndDelete: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findOne: jest.fn()
}));

const { generateToken } = require("../modules/auth/auth.service"); // Import generateToken
const app = require("../app");
const Student = require("../models/Student");
const User = require("../models/User");

const adminId = "64f000000000000000000001";
const teacherId = "64f000000000000000000002";
const studentUserId = "64f000000000000000000003";
const otherStudentUserId = "64f000000000000000000004";
const studentId = "64f000000000000000000005";

const users = {
  admin: { _id: adminId, fullName: "Admin User", email: "admin@example.com", role: "admin", isActive: true },
  teacher: { _id: teacherId, fullName: "Teacher User", email: "teacher@example.com", role: "teacher", isActive: true },
  student: { _id: studentUserId, fullName: "Student User", email: "student@example.com", role: "student", isActive: true }
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

const buildOneQuery = (result) => {
  const chain = {};
  chain.populate = jest.fn(() => chain);
  chain.lean = jest.fn().mockResolvedValue(result);
  return chain;
};

const mockAuthenticatedUser = (authUser, linkedStudentUser = users.student) => {
  User.findById.mockImplementation((id) => {
    if (String(id) === String(authUser._id)) {
      return {
        select: jest.fn().mockResolvedValue(authUser)
      };
    }

    return Promise.resolve(linkedStudentUser);
  });
};

const studentProfile = {
  _id: studentId,
  userId: {
    _id: studentUserId,
    fullName: "Student User",
    email: "student@example.com",
    role: "student",
    isActive: true
  },
  registrationNumber: "CS-2026-001",
  department: "Computer Science",
  semester: 3,
  session: "2024-2028",
  guardianName: "Grace Hopper",
  phone: "+92 300 0000000",
  address: "Main Campus"
};

describe("Student routes", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "student-test-secret";
    jest.clearAllMocks();
  });

  it("lists students with search filters and pagination for admins", async () => {
    mockAuthenticatedUser(users.admin);
    Student.find.mockReturnValue(buildManyQuery([studentProfile]));
    Student.countDocuments.mockResolvedValue(1);

    const response = await request(app)
      .get("/api/students?search=cs&department=Computer%20Science&semester=3&page=2&limit=5")
      .set("Authorization", `Bearer ${generateToken(users.admin)}`);

    expect(response.status).toBe(200);
    expect(response.body.data.students).toHaveLength(1);
    expect(response.body.data.pagination).toMatchObject({
      limit: 5,
      page: 2,
      total: 1,
      totalPages: 1
    });
    expect(Student.find).toHaveBeenCalledWith(
      expect.objectContaining({
        $or: expect.any(Array),
        department: expect.any(RegExp),
        semester: 3
      })
    );
  });

  it("allows admins to create student profiles", async () => {
    mockAuthenticatedUser(users.admin);
    Student.findOne.mockResolvedValue(null);
    Student.create.mockResolvedValue({ _id: studentId });
    Student.findById.mockReturnValue(buildOneQuery(studentProfile));

    const response = await request(app)
      .post("/api/students")
      .set("Authorization", `Bearer ${generateToken(users.admin)}`)
      .send({
        userId: studentUserId,
        registrationNumber: "cs-2026-001",
        department: "Computer Science",
        semester: 3,
        session: "2024-2028",
        guardianName: "Grace Hopper",
        phone: "+92 300 0000000",
        address: "Main Campus"
      });

    expect(response.status).toBe(201);
    expect(response.body.data.student.registrationNumber).toBe("CS-2026-001");
    expect(Student.create).toHaveBeenCalledWith(
      expect.objectContaining({
        registrationNumber: "CS-2026-001",
        semester: 3,
        userId: studentUserId
      })
    );
  });

  it("returns the current student's own profile", async () => {
    mockAuthenticatedUser(users.student);
    Student.findOne.mockReturnValue(buildOneQuery(studentProfile));

    const response = await request(app)
      .get("/api/students/me")
      .set("Authorization", `Bearer ${generateToken(users.student)}`);

    expect(response.status).toBe(200);
    expect(response.body.data.student._id).toBe(studentId);
    expect(Student.findOne).toHaveBeenCalledWith({ userId: studentUserId });
  });

  it("returns department aggregation counts", async () => {
    mockAuthenticatedUser(users.teacher);
    Student.aggregate.mockResolvedValue([{ department: "Computer Science", totalStudents: 4 }]);

    const response = await request(app)
      .get("/api/students/analytics/departments") // Use the imported generateToken
      .set("Authorization", `Bearer ${generateToken(users.teacher)}`);

    expect(response.status).toBe(200);
    expect(response.body.data.departments).toEqual([{ department: "Computer Science", totalStudents: 4 }]);
    expect(Student.aggregate).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ $group: expect.any(Object) })]));
  });
});
