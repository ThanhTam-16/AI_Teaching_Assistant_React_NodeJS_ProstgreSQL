const reportService = require("../services/report.service");
const { successResponse } = require("../utils/response");

const getOverviewReport = async (req, res, next) => {
  try {
    const lecturerId = req.user.id;
    const report = await reportService.getOverviewReport(lecturerId);

    return successResponse(res, "Overview report fetched successfully", report, 200);
  } catch (error) {
    next(error);
  }
};

const getClassReport = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const lecturerId = req.user.id;
    const report = await reportService.getClassReport(classId, lecturerId);

    return successResponse(res, "Class report fetched successfully", report, 200);
  } catch (error) {
    next(error);
  }
};

const getAssignmentReport = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const lecturerId = req.user.id;
    const report = await reportService.getAssignmentReport(assignmentId, lecturerId);

    return successResponse(res, "Assignment report fetched successfully", report, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverviewReport,
  getClassReport,
  getAssignmentReport,
};
