const express = require("express");
const lessonController = require("../controllers/lesson.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const { validate } = require("../middlewares/validate.middleware");
const {
  validateCreateLesson,
  validateUpdateLesson,
  validateAddMaterial,
} = require("../validations/lesson.validation");

const router = express.Router();

router.use(authenticate);

// --- STUDENT PATHS ---
router.get("/student", authorizeRoles("STUDENT"), lessonController.getStudentLessons);
router.get("/student/:id", authorizeRoles("STUDENT"), lessonController.getStudentLessonById);
router.get("/student/:id/materials", authorizeRoles("STUDENT"), lessonController.getStudentLessonMaterials);
router.get("/student/:id/assignments", authorizeRoles("STUDENT"), lessonController.getStudentLessonAssignments);

// Root paths (compatibility for mounting under /lecturer/lessons)
router.get("/", authorizeRoles("LECTURER"), lessonController.getLessons);
router.post("/", authorizeRoles("LECTURER"), validate(validateCreateLesson), lessonController.createLesson);

// Module paths (for mounting under /lessons)
router.get("/lecturer", authorizeRoles("LECTURER"), lessonController.getLessons);
router.get("/lecturer/:id", authorizeRoles("LECTURER"), lessonController.getLessonById);
router.post("/lecturer", authorizeRoles("LECTURER"), validate(validateCreateLesson), lessonController.createLesson);
router.put("/lecturer/:id", authorizeRoles("LECTURER"), validate(validateUpdateLesson), lessonController.updateLesson);
router.delete("/lecturer/:id", authorizeRoles("LECTURER"), lessonController.deleteLesson);
router.patch("/lecturer/:id/status", authorizeRoles("LECTURER"), lessonController.updateLessonStatus);

// Materials sub-module paths
router.post("/lecturer/:id/materials", authorizeRoles("LECTURER"), validate(validateAddMaterial), lessonController.addLessonMaterial);
router.get("/lecturer/:id/materials", authorizeRoles("LECTURER"), lessonController.getLessonMaterials);
router.delete("/lecturer/:id/materials/:materialId", authorizeRoles("LECTURER"), lessonController.deleteLessonMaterial);

// Relative paths (compatibility for mounting under /lecturer/lessons)
router.get("/:id", authorizeRoles("LECTURER"), lessonController.getLessonById);
router.put("/:id", authorizeRoles("LECTURER"), validate(validateUpdateLesson), lessonController.updateLesson);
router.delete("/:id", authorizeRoles("LECTURER"), lessonController.deleteLesson);
router.patch("/:id/status", authorizeRoles("LECTURER"), lessonController.updateLessonStatus);

// Materials relative paths (compatibility for mounting under /lecturer/lessons)
router.post("/:id/materials", authorizeRoles("LECTURER"), validate(validateAddMaterial), lessonController.addLessonMaterial);
router.get("/:id/materials", authorizeRoles("LECTURER"), lessonController.getLessonMaterials);
router.delete("/:id/materials/:materialId", authorizeRoles("LECTURER"), lessonController.deleteLessonMaterial);

module.exports = router;
