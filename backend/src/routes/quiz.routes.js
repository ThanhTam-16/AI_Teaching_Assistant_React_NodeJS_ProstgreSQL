const express = require("express");
const quizController = require("../controllers/quiz.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = Router = express.Router();

router.use(authenticate);

// --- STUDENT PATHS ---
router.get("/student", authorizeRoles("STUDENT"), quizController.getStudentQuizzes);
router.get("/student/:id", authorizeRoles("STUDENT"), quizController.getStudentQuizById);

// Root paths (compatibility for mounting under /lecturer/quizzes and /lecturer/quiz-questions)
router.get("/quizzes", authorizeRoles("LECTURER"), quizController.getQuizzes);
router.get("/quizzes/:id", authorizeRoles("LECTURER"), quizController.getQuizById);
router.post("/quizzes", authorizeRoles("LECTURER"), quizController.createQuiz);
router.put("/quizzes/:id", authorizeRoles("LECTURER"), quizController.updateQuiz);
router.delete("/quizzes/:id", authorizeRoles("LECTURER"), quizController.deleteQuiz);
router.post("/quizzes/:id/questions", authorizeRoles("LECTURER"), quizController.addQuizQuestion);
router.put("/quiz-questions/:questionId", authorizeRoles("LECTURER"), quizController.updateQuizQuestion);
router.delete("/quiz-questions/:questionId", authorizeRoles("LECTURER"), quizController.deleteQuizQuestion);

// Module paths (for mounting under /quizzes and /quiz-questions)
router.get("/lecturer", authorizeRoles("LECTURER"), quizController.getQuizzes);
router.get("/lecturer/:id", authorizeRoles("LECTURER"), quizController.getQuizById);
router.post("/lecturer", authorizeRoles("LECTURER"), quizController.createQuiz);
router.put("/lecturer/:id", authorizeRoles("LECTURER"), quizController.updateQuiz);
router.delete("/lecturer/:id", authorizeRoles("LECTURER"), quizController.deleteQuiz);
router.post("/lecturer/:id/questions", authorizeRoles("LECTURER"), quizController.addQuizQuestion);
router.put("/questions/lecturer/:questionId", authorizeRoles("LECTURER"), quizController.updateQuizQuestion);
router.delete("/questions/lecturer/:questionId", authorizeRoles("LECTURER"), quizController.deleteQuizQuestion);

// Relative fallback paths
router.put("/:questionId", authorizeRoles("LECTURER"), quizController.updateQuizQuestion);
router.delete("/:questionId", authorizeRoles("LECTURER"), quizController.deleteQuizQuestion);

module.exports = router;
