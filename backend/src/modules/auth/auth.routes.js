const express = require("express");

const authController = require("./auth.controller");
const { protect } = require("../../middleware/authMiddleware");
const validateRequest = require("../../middleware/validateRequest");
const { loginSchema, registerSchema } = require("./auth.validators");

const router = express.Router();

// Public registration kept for tests but in UI we will not expose it. Keep for compatibility.
router.post("/register", validateRequest(registerSchema), authController.register);
router.post("/login", validateRequest(loginSchema), authController.login);
router.get("/profile", protect, authController.getProfile);

// Development/demo endpoint: ensures demo admin and teacher exist and returns their credentials.
// Intended for local/dev only.
router.get("/demo-credentials", authController.getDemoCredentials);

module.exports = router;
