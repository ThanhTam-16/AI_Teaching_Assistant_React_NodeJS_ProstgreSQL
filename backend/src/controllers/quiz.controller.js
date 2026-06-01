const quizService = require("../services/quiz.service");
const { successResponse } = require("../utils/response");
const { getPaginationParams } = require("../utils/pagination");

const getQuizzes = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { subjectId, lessonId } = req.query;
    const lecturerId = req.user.id;

    const result = await quizService.getQuizzes({
      page,
      limit,
      skip,
      subjectId,
      lessonId,
      lecturerId,
    });

    return successResponse(res, "Quizzes fetched successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

const getQuizById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lecturerId = req.user.id;
    const quiz = await quizService.getQuizById(id, lecturerId);

    return successResponse(res, "Quiz details fetched successfully", quiz, 200);
  } catch (error) {
    next(error);
  }
};

const createQuiz = async (req, res, next) => {
  try {
    const lecturerId = req.user.id;
    const quiz = await quizService.createQuiz(req.body, lecturerId);

    return successResponse(res, "Quiz created successfully", quiz, 201);
  } catch (error) {
    next(error);
  }
};

const updateQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lecturerId = req.user.id;
    const quiz = await quizService.updateQuiz(id, req.body, lecturerId);

    return successResponse(res, "Quiz updated successfully", quiz, 200);
  } catch (error) {
    next(error);
  }
};

const deleteQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lecturerId = req.user.id;
    const result = await quizService.deleteQuiz(id, lecturerId);

    return successResponse(res, "Quiz deleted successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

const addQuizQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lecturerId = req.user.id;
    const question = await quizService.addQuizQuestion(id, req.body, lecturerId);

    return successResponse(res, "Quiz question added successfully", question, 201);
  } catch (error) {
    next(error);
  }
};

const updateQuizQuestion = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const lecturerId = req.user.id;
    const question = await quizService.updateQuizQuestion(questionId, req.body, lecturerId);

    return successResponse(res, "Quiz question updated successfully", question, 200);
  } catch (error) {
    next(error);
  }
};

const deleteQuizQuestion = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const lecturerId = req.user.id;
    const result = await quizService.deleteQuizQuestion(questionId, lecturerId);

    return successResponse(res, "Quiz question deleted successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

const getStudentQuizzes = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { subjectId, lessonId } = req.query;
    const studentId = req.user.id;

    const result = await quizService.getStudentQuizzes({
      page,
      limit,
      skip,
      subjectId,
      lessonId,
      studentId,
    });

    return successResponse(res, "Student quizzes fetched successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

const getStudentQuizById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;
    const quiz = await quizService.getStudentQuizById(id, studentId);

    return successResponse(res, "Student quiz details fetched successfully", quiz, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  addQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
  getStudentQuizzes,
  getStudentQuizById,
};
