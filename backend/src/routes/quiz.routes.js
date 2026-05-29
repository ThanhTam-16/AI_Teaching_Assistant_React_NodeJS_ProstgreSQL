const express = require("express");
const quizController = require("../controllers/quiz.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = Router = express.Router();

router.use(authenticate);
router.use(authorizeRoles("LECTURER"));

// Root paths (compatibility for mounting under /lecturer/quizzes and /lecturer/quiz-questions)
router.get("/quizzes", quizController.getQuizzes);
router.get("/quizzes/:id", quizController.getQuizById);
router.post("/quizzes", quizController.createQuiz);
router.put("/quizzes/:id", quizController.updateQuiz);
router.delete("/quizzes/:id", quizController.deleteQuiz);
router.post("/quizzes/:id/questions", quizController.addQuizQuestion);
router.put("/quiz-questions/:questionId", quizController.updateQuizQuestion);
router.delete("/quiz-questions/:questionId", quizController.deleteQuizQuestion);

// Module paths (for mounting under /quizzes and /quiz-questions)
router.get("/lecturer", quizController.getQuizzes);
router.get("/lecturer/:id", quizController.getQuizById);
router.post("/lecturer", quizController.createQuiz);
router.put("/lecturer/:id", quizController.updateQuiz);
router.delete("/lecturer/:id", quizController.deleteQuiz);
router.post("/lecturer/:id/questions", quizController.addQuizQuestion);
router.put("/questions/lecturer/:questionId", quizController.updateQuizQuestion);
router.delete("/questions/lecturer/:questionId", quizController.deleteQuizQuestion);

// Relative fallback paths
router.put("/:questionId", quizController.updateQuizQuestion);
router.delete("/:questionId", quizController.deleteQuizQuestion);

module.exports = router;
