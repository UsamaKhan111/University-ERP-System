const express = require("express");

const { authorize, protect } = require("../../middleware/authMiddleware");
const validateRequest = require("../../middleware/validateRequest");
const feeController = require("./fee.controller");
const { createFeeSchema, feeIdSchema, studentFeesSchema } = require("./fee.validators");

const router = express.Router();

router.get("/analytics/dues", protect, authorize("admin"), feeController.getDueSummary);
router.get("/:id/receipt", protect, authorize("admin", "student"), validateRequest(feeIdSchema), feeController.getReceipt);
router.post("/", protect, authorize("admin"), validateRequest(createFeeSchema), feeController.createFee);
router.get(
  "/student/:id",
  protect,
  authorize("admin", "student"),
  validateRequest(studentFeesSchema),
  feeController.getStudentFees
);

module.exports = router;
