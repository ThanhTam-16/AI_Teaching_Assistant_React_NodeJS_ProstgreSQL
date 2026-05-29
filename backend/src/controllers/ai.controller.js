const aiService = require("../services/ai.service");
const { successResponse } = require("../utils/response");

const generateExercises = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      const error = new Error("Prompt is required");
      error.statusCode = 400;
      throw error;
    }

    const userId = req.user.id;
    const result = await aiService.generateExercises(prompt, userId);

    return successResponse(res, "Exercises generated successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

const generateQuiz = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      const error = new Error("Prompt is required");
      error.statusCode = 400;
      throw error;
    }

    const userId = req.user.id;
    const result = await aiService.generateQuiz(prompt, userId);

    return successResponse(res, "Quiz generated successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

const generateFeedback = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      const error = new Error("Prompt is required");
      error.statusCode = 400;
      throw error;
    }

    const userId = req.user.id;
    const result = await aiService.generateFeedback(prompt, userId);

    return successResponse(res, "Feedback generated successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

const generateLessonOutline = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      const error = new Error("Prompt is required");
      error.statusCode = 400;
      throw error;
    }

    const userId = req.user.id;
    const result = await aiService.generateLessonOutline(prompt, userId);

    return successResponse(res, "Lesson outline generated successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

const generateSlideOutline = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      const error = new Error("Prompt is required");
      error.statusCode = 400;
      throw error;
    }

    const userId = req.user.id;
    const result = await aiService.generateSlideOutline(prompt, userId);

    return successResponse(res, "Slide outline generated successfully", result, 200);
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
};
