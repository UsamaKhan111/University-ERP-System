const express = require("express");

const { authorize, protect } = require("../../middleware/authMiddleware");
const validateRequest = require("../../middleware/validateRequest");
const enrollmentController = require("./enrollment.controller");
const { createEnrollmentSchema } = require("./enrollment.validators");

const router = express.Router();

router.post("/", protect, authorize("admin"), validateRequest(createEnrollmentSchema), enrollmentController.createEnrollment);

module.exports = router;
