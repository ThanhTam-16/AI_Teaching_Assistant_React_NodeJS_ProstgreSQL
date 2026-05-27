const dashboardService = require("../services/dashboard.service");
const { successResponse } = require("../utils/response");

const getStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getStats();
    return successResponse(res, "Admin dashboard stats fetched successfully", stats, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
};
