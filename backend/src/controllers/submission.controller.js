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

const submitAssignment = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user.id;
    const { content, fileUrl, githubUrl, codeText } = req.body;

    const submission = await submissionService.submitAssignment({
      studentId,
      assignmentId,
      content,
      fileUrl,
      githubUrl,
      codeText,
    });

    return successResponse(res, "Assignment submitted successfully", submission, 201);
  } catch (error) {
    next(error);
  }
};

const updateSubmission = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const studentId = req.user.id;
    const { content, fileUrl, githubUrl, codeText } = req.body;

    const submission = await submissionService.updateSubmission({
      studentId,
      submissionId,
      content,
      fileUrl,
      githubUrl,
      codeText,
    });

    return successResponse(res, "Submission updated successfully", submission, 200);
  } catch (error) {
    next(error);
  }
};

const getStudentSubmissions = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { status, assignmentId } = req.query;
    const studentId = req.user.id;

    const result = await submissionService.getStudentSubmissions({
      page,
      limit,
      skip,
      status,
      assignmentId,
      studentId,
    });

    return successResponse(res, "Student submissions fetched successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

const getStudentSubmissionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;
    const submission = await submissionService.getStudentSubmissionById(id, studentId);

    return successResponse(res, "Student submission details fetched successfully", submission, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSubmissions,
  getSubmissionById,
  getAssignmentSubmissions,
  submitAssignment,
  updateSubmission,
  getStudentSubmissions,
  getStudentSubmissionById,
};
