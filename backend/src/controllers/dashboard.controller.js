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

const getLecturerStats = async (req, res, next) => {
  try {
    const lecturerId = req.user.id;
    const stats = await dashboardService.getLecturerStats(lecturerId);
    return successResponse(res, "Lecturer dashboard overview fetched successfully", stats, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getLecturerStats,
};
