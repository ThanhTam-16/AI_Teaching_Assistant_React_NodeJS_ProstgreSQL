const express = require("express");
const subjectController = require("../controllers/subject.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const { validate } = require("../middlewares/validate.middleware");
const {
  validateCreateSubject,
  validateUpdateSubject,
  validateAssignLecturer,
} = require("../validations/subject.validation");

const router = express.Router();

// All subject routes require login and ADMIN role
router.use(authenticate);
router.use(authorizeRoles("ADMIN"));

router.get("/", subjectController.getSubjects);
router.get("/:id", subjectController.getSubjectById);
router.post("/", validate(validateCreateSubject), subjectController.createSubject);
router.put("/:id", validate(validateUpdateSubject), subjectController.updateSubject);
router.delete("/:id", subjectController.deleteSubject);

// Lecturer Assignment endpoints
router.get("/:id/lecturers", subjectController.getLecturers);
router.post("/:id/lecturers", validate(validateAssignLecturer), subjectController.assignLecturer);
router.delete("/:id/lecturers/:lecturerId", subjectController.removeLecturer);

module.exports = router;
