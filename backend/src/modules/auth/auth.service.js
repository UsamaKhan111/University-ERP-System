const jwt = require("jsonwebtoken"); // Re-introduced jsonwebtoken

const User = require("../../models/User");

const sanitizeUser = (user) => {
  const source = typeof user.toObject === "function" ? user.toObject() : user;
  const { password, __v, ...safeUser } = source;
  return safeUser;
};

const generateToken = (user) => {
  // Generate a valid JWT for the demo user
  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    process.env.JWT_SECRET || "supersecretjwtkey", // Use env secret or a fallback
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d"
    }
  );
};

const registerUser = async (payload) => {
  // normalize email to lowercase before creating
  const normalized = { ...payload, email: payload.email && String(payload.email).toLowerCase() };
  const user = await User.create(normalized);
  return {
    token: generateToken(user),
    user: sanitizeUser(user)
  };
};

const loginUser = async (payload) => {
  const { email, password: candidate } = payload || {};
  const normalizedEmail = email && String(email).toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select("+password");

  if (!user) {
    const ApiError = require("../../utils/apiError");
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await user.comparePassword(candidate);

  if (!isMatch) {
    const ApiError = require("../../utils/apiError");
    throw new ApiError(401, "Invalid email or password");
  }

  // update last login without running validations
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  return {
    token: generateToken(user),
    user: sanitizeUser(user)
  };
};

const ensureDemoAccounts = async () => {
  const adminEmail = "admin@example.com";
  const teacherEmail = "teacher@example.com";
  const studentEmail = "student@example.com";

  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    await User.create({ fullName: "System Admin", email: adminEmail, password: "demo", role: "admin", isActive: true });
  }

  let teacher = await User.findOne({ email: teacherEmail });
  if (!teacher) {
    await User.create({ fullName: "Demo Teacher", email: teacherEmail, password: "demo", role: "teacher", isActive: true });
  }

  let student = await User.findOne({ email: studentEmail });
  if (!student) {
    await User.create({ fullName: "Demo Student", email: studentEmail, password: "demo", role: "student", isActive: true });
  }

  return {
    admin: { email: adminEmail, password: "demo" },
    teacher: { email: teacherEmail, password: "demo" },
    student: { email: studentEmail, password: "demo" }
  };
};

module.exports = {
  generateToken,
  loginUser,
  registerUser,
  sanitizeUser,
  ensureDemoAccounts
};
