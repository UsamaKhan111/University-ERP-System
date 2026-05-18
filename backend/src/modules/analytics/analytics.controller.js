const asyncHandler = require("../../utils/asyncHandler");
const analyticsService = require("./analytics.service");

const getDashboardAnalytics = asyncHandler(async (_req, res) => {
  const analytics = await analyticsService.getDashboardAnalytics();

  res.status(200).json({
    success: true,
    data: analytics
  });
});

module.exports = {
  getDashboardAnalytics
};
