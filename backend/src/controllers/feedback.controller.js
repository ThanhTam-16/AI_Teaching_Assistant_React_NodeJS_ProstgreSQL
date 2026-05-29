const feedbackService = require("../services/feedback.service");
const { successResponse } = require("../utils/response");

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

module.exports = {
  getSubmissionsFeedbacks,
  createSubmissionFeedback,
  updateFeedback,
  deleteFeedback,
};
