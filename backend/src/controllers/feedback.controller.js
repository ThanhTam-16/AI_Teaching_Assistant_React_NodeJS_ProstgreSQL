const feedbackService = require("../services/feedback.service");
const { successResponse } = require("../utils/response");
const { getPaginationParams } = require("../utils/pagination");

const getSubmissionsFeedbacks = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const lecturerId = req.user.id;
    const feedbacks = await feedbackService.getSubmissionsFeedbacks(submissionId, lecturerId);

    return successResponse(res, "Feedbacks fetched successfully", feedbacks, 200);
  } catch (error) {
    next(error);
  }
};

const createSubmissionFeedback = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const lecturerId = req.user.id;
    const feedback = await feedbackService.createSubmissionFeedback(submissionId, req.body, lecturerId);

    return successResponse(res, "Feedback created successfully", feedback, 201);
  } catch (error) {
    next(error);
  }
};

const updateFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lecturerId = req.user.id;
    const feedback = await feedbackService.updateFeedback(id, req.body, lecturerId);

    return successResponse(res, "Feedback updated successfully", feedback, 200);
  } catch (error) {
    next(error);
  }
};

const deleteFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lecturerId = req.user.id;
    const result = await feedbackService.deleteFeedback(id, lecturerId);

    return successResponse(res, "Feedback deleted successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

const getStudentFeedbacks = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const studentId = req.user.id;
    const result = await feedbackService.getStudentFeedbacks({ studentId, page, limit, skip });

    return successResponse(res, "Student feedbacks fetched successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

const getStudentFeedbackBySubmissionId = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const studentId = req.user.id;
    const feedbacks = await feedbackService.getStudentFeedbackBySubmissionId(submissionId, studentId);

    return successResponse(res, "Student feedbacks for submission fetched successfully", feedbacks, 200);
  } catch (error) {
    next(error);
  }
};

const getStudentFeedbackByAssignmentId = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user.id;
    const feedbacks = await feedbackService.getStudentFeedbackByAssignmentId(assignmentId, studentId);

    return successResponse(res, "Student feedbacks for assignment fetched successfully", feedbacks, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSubmissionsFeedbacks,
  createSubmissionFeedback,
  updateFeedback,
  deleteFeedback,
  getStudentFeedbacks,
  getStudentFeedbackBySubmissionId,
  getStudentFeedbackByAssignmentId,
};
