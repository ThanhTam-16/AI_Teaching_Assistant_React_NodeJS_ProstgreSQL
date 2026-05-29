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
router.use(authorizeRoles("LECTURER"));

// Root paths (compatibility for mounting under /lecturer/lessons)
router.get("/", lessonController.getLessons);
router.post("/", validate(validateCreateLesson), lessonController.createLesson);

// Module paths (for mounting under /lessons)
router.get("/lecturer", lessonController.getLessons);
router.get("/lecturer/:id", lessonController.getLessonById);
router.post("/lecturer", validate(validateCreateLesson), lessonController.createLesson);
router.put("/lecturer/:id", validate(validateUpdateLesson), lessonController.updateLesson);
router.delete("/lecturer/:id", lessonController.deleteLesson);
router.patch("/lecturer/:id/status", lessonController.updateLessonStatus);

// Materials sub-module paths
router.post("/lecturer/:id/materials", validate(validateAddMaterial), lessonController.addLessonMaterial);
router.get("/lecturer/:id/materials", lessonController.getLessonMaterials);
router.delete("/lecturer/:id/materials/:materialId", lessonController.deleteLessonMaterial);

// Relative paths (compatibility for mounting under /lecturer/lessons)
router.get("/:id", lessonController.getLessonById);
router.put("/:id", validate(validateUpdateLesson), lessonController.updateLesson);
router.delete("/:id", lessonController.deleteLesson);
router.patch("/:id/status", lessonController.updateLessonStatus);

// Materials relative paths (compatibility for mounting under /lecturer/lessons)
router.post("/:id/materials", validate(validateAddMaterial), lessonController.addLessonMaterial);
router.get("/:id/materials", lessonController.getLessonMaterials);
router.delete("/:id/materials/:materialId", lessonController.deleteLessonMaterial);

module.exports = router;
