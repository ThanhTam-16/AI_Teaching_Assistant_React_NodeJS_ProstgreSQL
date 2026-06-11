const aiService = require("../services/ai.service");
const { successResponse } = require("../utils/response");

const generateExercises = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await aiService.generateExercises(req.body, userId);
    return successResponse(res, "Exercises generated successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

const generateQuiz = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await aiService.generateQuiz(req.body, userId);
    return successResponse(res, "Quiz generated successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

const generateFeedback = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await aiService.generateFeedback(req.body, userId);
    return successResponse(res, "Feedback generated successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

const generateLessonOutline = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await aiService.generateLessonOutline(req.body, userId);
    return successResponse(res, "Lesson outline generated successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

const generateSlideOutline = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await aiService.generateSlideOutline(req.body, userId);
    return successResponse(res, "Slide outline generated successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

const getAIHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await aiService.getAIHistory(userId, req.query);
    return successResponse(res, "AI history retrieved successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

const getAIHistoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await aiService.getAIHistoryById(userId, id);
    return successResponse(res, "AI history record retrieved successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

const saveExerciseAsAssignment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const assignment = await aiService.saveExerciseAsAssignment(userId, req.body);
    return successResponse(res, "AI Exercise saved as Assignment successfully", assignment, 201);
  } catch (error) {
    next(error);
  }
};

const saveQuiz = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const quiz = await aiService.saveQuiz(userId, req.body);
    return successResponse(res, "AI Quiz saved successfully", quiz, 201);
  } catch (error) {
    next(error);
  }
};

const saveLessonOutline = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const lesson = await aiService.saveLessonOutline(userId, req.body);
    return successResponse(res, "AI Lesson Outline saved successfully", lesson, 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateExercises,
  generateQuiz,
  generateFeedback,
  generateLessonOutline,
  generateSlideOutline,
  getAIHistory,
  getAIHistoryById,
  saveExerciseAsAssignment,
  saveQuiz,
  saveLessonOutline,
};
