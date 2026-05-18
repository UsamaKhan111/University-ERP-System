const jwt = require("jsonwebtoken");

const User = require("../../models/User");
const ApiError = require("../../utils/apiError");

const sanitizeUser = (user) => {
  const source = typeof user.toObject === "function" ? user.toObject() : user;
  const { password, __v, ...safeUser } = source;
  return safeUser;
};

const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new ApiError(500, "JWT_SECRET is missing from environment variables");
  }
  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    process.env.JWT_SECRET,
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
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await user.comparePassword(candidate);

  if (!isMatch) {
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

module.exports = {
  generateToken,
  loginUser,
  registerUser,
  sanitizeUser
};
