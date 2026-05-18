const authService = require("./auth.service");
const asyncHandler = require("../../utils/asyncHandler");

const register = asyncHandler(async (req, res) => {
  const authPayload = await authService.registerUser(req.body);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: authPayload
  });
});

const login = asyncHandler(async (req, res) => {
  const authPayload = await authService.loginUser(req.body);

  res.status(200).json({
    success: true,
    message: "User logged in successfully",
    data: authPayload
  });
});

const getProfile = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: authService.sanitizeUser(req.user)
    }
  });
});

// For development/demo purposes only: ensure demo accounts exist and return their credentials.
const getDemoCredentials = asyncHandler(async (req, res) => {
  const creds = await authService.ensureDemoAccounts();

  res.status(200).json({
    success: true,
    data: creds
  });
});

module.exports = {
  getProfile,
  login,
  register,
  getDemoCredentials
};
