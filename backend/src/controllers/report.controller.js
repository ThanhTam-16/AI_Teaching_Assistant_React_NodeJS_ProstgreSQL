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

const getStudentProgress = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const progress = await reportService.getStudentProgress(studentId);

    return successResponse(res, "Student progress report fetched successfully", progress, 200);
  } catch (error) {
    next(error);
  }
};

const getStudentSubjectProgress = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const studentId = req.user.id;
    const progress = await reportService.getStudentSubjectProgress(studentId, subjectId);

    return successResponse(res, "Student subject progress report fetched successfully", progress, 200);
  } catch (error) {
    next(error);
  }
};

const getStudentClassProgress = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const studentId = req.user.id;
    const progress = await reportService.getStudentClassProgress(studentId, classId);

    return successResponse(res, "Student class progress report fetched successfully", progress, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverviewReport,
  getClassReport,
  getAssignmentReport,
  getStudentProgress,
  getStudentSubjectProgress,
  getStudentClassProgress,
};
