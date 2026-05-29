const submissionService = require("../services/submission.service");
const { successResponse } = require("../utils/response");
const { getPaginationParams } = require("../utils/pagination");

const getSubmissions = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { classId, assignmentId, status } = req.query;
    const lecturerId = req.user.id;

    const result = await submissionService.getSubmissions({
      page,
      limit,
      skip,
      classId,
      assignmentId,
      status,
      lecturerId,
    });

    return successResponse(res, "Submissions fetched successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

const getSubmissionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lecturerId = req.user.id;
    const submission = await submissionService.getSubmissionById(id, lecturerId);

    return successResponse(res, "Submission details fetched successfully", submission, 200);
  } catch (error) {
    next(error);
  }
};

const getAssignmentSubmissions = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const lecturerId = req.user.id;
    const submissions = await submissionService.getAssignmentSubmissions(assignmentId, lecturerId);

    return successResponse(res, "Assignment submissions fetched successfully", submissions, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSubmissions,
  getSubmissionById,
  getAssignmentSubmissions,
};
