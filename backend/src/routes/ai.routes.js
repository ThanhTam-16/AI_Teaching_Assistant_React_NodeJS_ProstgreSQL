const express = require("express");
const aiController = require("../controllers/ai.controller");
const settingController = require("../controllers/setting.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const { validate } = require("../middlewares/validate.middleware");
const aiValidation = require("../validations/ai.validation");

const router = express.Router();

router.use(authenticate);

// Dynamic check for admin vs lecturer
const checkAdminRoute = (req, res, next) => {
  if (req.baseUrl.includes("/admin/ai-features") || req.path.startsWith("/admin")) {
    return authorizeRoles("ADMIN")(req, res, next);
  }
  return authorizeRoles("LECTURER")(req, res, next);
};

// --- Admin AI Features Endpoints ---
router.get("/", checkAdminRoute, (req, res, next) => {
  if (req.baseUrl.includes("/admin/ai-features")) {
    return settingController.getAIFeatures(req, res, next);
  }
  return res.status(404).json({ success: false, message: "Route not found" });
});

router.patch("/:id/status", authorizeRoles("ADMIN"), settingController.updateAIFeature);
router.get("/admin/features", authorizeRoles("ADMIN"), settingController.getAIFeatures);
router.patch("/admin/features/:id/status", authorizeRoles("ADMIN"), settingController.updateAIFeature);

// --- Lecturer AI History Endpoints ---
router.get("/history", authorizeRoles("LECTURER"), aiController.getAIHistory);
router.get("/history/:id", authorizeRoles("LECTURER"), aiController.getAIHistoryById);
router.delete("/history/:id", authorizeRoles("LECTURER"), aiController.deleteAIHistory);
router.get("/lecturer/history", authorizeRoles("LECTURER"), aiController.getAIHistory);
router.get("/lecturer/history/:id", authorizeRoles("LECTURER"), aiController.getAIHistoryById);
router.delete("/lecturer/history/:id", authorizeRoles("LECTURER"), aiController.deleteAIHistory);

// --- Lecturer AI Generation Endpoints ---
// Root paths (compatibility for mounting under /lecturer/ai)
router.post("/exercises", authorizeRoles("LECTURER"), validate(aiValidation.validateGenerateExercises), aiController.generateExercises);
router.post("/quizzes", authorizeRoles("LECTURER"), validate(aiValidation.validateGenerateQuiz), aiController.generateQuiz);
router.post("/feedback", authorizeRoles("LECTURER"), validate(aiValidation.validateGenerateFeedback), aiController.generateFeedback);
router.post("/lesson-outline", authorizeRoles("LECTURER"), validate(aiValidation.validateGenerateLessonOutline), aiController.generateLessonOutline);
router.post("/slide-outline", authorizeRoles("LECTURER"), validate(aiValidation.validateGenerateSlideOutline), aiController.generateSlideOutline);

// Module paths (for mounting under /ai)
router.post("/lecturer/exercises", authorizeRoles("LECTURER"), validate(aiValidation.validateGenerateExercises), aiController.generateExercises);
router.post("/lecturer/quizzes", authorizeRoles("LECTURER"), validate(aiValidation.validateGenerateQuiz), aiController.generateQuiz);
router.post("/lecturer/feedback", authorizeRoles("LECTURER"), validate(aiValidation.validateGenerateFeedback), aiController.generateFeedback);
router.post("/lecturer/lesson-outline", authorizeRoles("LECTURER"), validate(aiValidation.validateGenerateLessonOutline), aiController.generateLessonOutline);
router.post("/lecturer/slide-outline", authorizeRoles("LECTURER"), validate(aiValidation.validateGenerateSlideOutline), aiController.generateSlideOutline);

// --- Lecturer AI Saver Endpoints ---
router.post("/exercises/save-assignment", authorizeRoles("LECTURER"), aiController.saveExerciseAsAssignment);
router.post("/quizzes/save", authorizeRoles("LECTURER"), aiController.saveQuiz);
router.post("/lesson-outline/save", authorizeRoles("LECTURER"), aiController.saveLessonOutline);

router.post("/lecturer/exercises/save-assignment", authorizeRoles("LECTURER"), aiController.saveExerciseAsAssignment);
router.post("/lecturer/quizzes/save", authorizeRoles("LECTURER"), aiController.saveQuiz);
router.post("/lecturer/lesson-outline/save", authorizeRoles("LECTURER"), aiController.saveLessonOutline);

module.exports = router;
