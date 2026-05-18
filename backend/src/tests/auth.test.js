const jwt = require("jsonwebtoken");
const request = require("supertest");

jest.mock("../models/User", () => ({
  create: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn()
}));

const app = require("../app");
const User = require("../models/User");

const createMockUser = (overrides = {}) => {
  const user = {
    _id: "user-123",
    fullName: "Ada Lovelace",
    email: "ada@example.com",
    role: "student",
    isActive: true,
    lastLogin: null,
    ...overrides
  };

  user.toObject = () => ({
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    lastLogin: user.lastLogin
  });

  return user;
};

describe("Auth routes", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_EXPIRES_IN = "1h";
    jest.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("rejects invalid registration payloads", async () => {
      const response = await request(app).post("/api/auth/register").send({
        fullName: "A",
        email: "not-an-email",
        password: "short",
        role: "principal"
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(User.create).not.toHaveBeenCalled();
    });

    it("registers a user and returns a JWT", async () => {
      const user = createMockUser();
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(user);

      const response = await request(app).post("/api/auth/register").send({
        fullName: "Ada Lovelace",
        email: "ADA@example.com",
        password: "password123",
        role: "student"
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.password).toBeUndefined();
      expect(response.body.data.user.email).toBe("ada@example.com");
      expect(jwt.verify(response.body.data.token, "test-secret")).toMatchObject({
        id: "user-123",
        role: "student"
      });
      expect(User.create).toHaveBeenCalledWith({
        fullName: "Ada Lovelace",
        email: "ada@example.com",
        password: "password123",
        role: "student"
      });
    });
  });

  describe("POST /api/auth/login", () => {
    it("logs in active users with valid credentials", async () => {
      const user = createMockUser({
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(undefined)
      });

      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(user)
      });

      const response = await request(app).post("/api/auth/login").send({
        email: "ada@example.com",
        password: "password123"
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toEqual(expect.any(String));
      expect(user.comparePassword).toHaveBeenCalledWith("password123");
      expect(user.save).toHaveBeenCalledWith({ validateBeforeSave: false });
    });

    it("rejects invalid credentials", async () => {
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      const response = await request(app).post("/api/auth/login").send({
        email: "ada@example.com",
        password: "wrong-password"
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid email or password");
    });
  });

  describe("GET /api/auth/profile", () => {
    it("blocks requests without a token", async () => {
      const response = await request(app).get("/api/auth/profile");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Authentication token is required");
    });

    it("returns the current authenticated user", async () => {
      const profileUser = createMockUser({ role: "teacher" });
      const token = jwt.sign({ id: "user-123", role: "teacher" }, "test-secret");

      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(profileUser)
      });

      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toMatchObject({
        _id: "user-123",
        email: "ada@example.com",
        role: "teacher"
      });
    });
  });
});
