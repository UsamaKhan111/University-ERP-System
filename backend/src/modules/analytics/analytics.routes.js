const express = require("express");

const { cacheResponse } = require("../../middleware/cacheMiddleware");
const { authorize, protect } = require("../../middleware/authMiddleware");
const analyticsController = require("./analytics.controller");

const router = express.Router();

router.get(
  "/dashboard",
  protect,
  authorize("admin"),
  cacheResponse({ prefix: "analytics", ttlSeconds: 60 }),
  analyticsController.getDashboardAnalytics
);

module.exports = router;
