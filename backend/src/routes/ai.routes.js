const express = require("express");
const aiController = require("../controllers/ai.controller");
const settingController = require("../controllers/setting.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

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

// Clean modular paths (when mounted at /ai)
router.get("/admin/features", authorizeRoles("ADMIN"), settingController.getAIFeatures);
router.patch("/admin/features/:id/status", authorizeRoles("ADMIN"), settingController.updateAIFeature);

// --- Lecturer AI Generation Endpoints ---
// Root paths (compatibility for mounting under /lecturer/ai)
router.post("/exercises", authorizeRoles("LECTURER"), aiController.generateExercises);
router.post("/quizzes", authorizeRoles("LECTURER"), aiController.generateQuiz);
router.post("/feedback", authorizeRoles("LECTURER"), aiController.generateFeedback);
router.post("/lesson-outline", authorizeRoles("LECTURER"), aiController.generateLessonOutline);
router.post("/slide-outline", authorizeRoles("LECTURER"), aiController.generateSlideOutline);

// Module paths (for mounting under /ai)
router.post("/lecturer/exercises", authorizeRoles("LECTURER"), aiController.generateExercises);
router.post("/lecturer/quizzes", authorizeRoles("LECTURER"), aiController.generateQuiz);
router.post("/lecturer/feedback", authorizeRoles("LECTURER"), aiController.generateFeedback);
router.post("/lecturer/lesson-outline", authorizeRoles("LECTURER"), aiController.generateLessonOutline);
router.post("/lecturer/slide-outline", authorizeRoles("LECTURER"), aiController.generateSlideOutline);

module.exports = router;
