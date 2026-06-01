const express = require("express");
const assignmentController = require("../controllers/assignment.controller");
const submissionController = require("../controllers/submission.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const { validate } = require("../middlewares/validate.middleware");
const {
  validateCreateAssignment,
  validateUpdateAssignment,
} = require("../validations/assignment.validation");

const router = express.Router();

router.use(authenticate);

// --- STUDENT PATHS ---
router.get("/student", authorizeRoles("STUDENT"), assignmentController.getStudentAssignments);
router.get("/student/:id", authorizeRoles("STUDENT"), assignmentController.getStudentAssignmentById);
router.get("/student/:id/my-submission", authorizeRoles("STUDENT"), assignmentController.getStudentAssignmentMySubmission);

// Root paths (compatibility for mounting under /lecturer/assignments)
router.get("/", authorizeRoles("LECTURER"), assignmentController.getAssignments);
router.post("/", authorizeRoles("LECTURER"), validate(validateCreateAssignment), assignmentController.createAssignment);

// Module paths (for mounting under /assignments)
router.get("/lecturer", authorizeRoles("LECTURER"), assignmentController.getAssignments);
router.get("/lecturer/:id", authorizeRoles("LECTURER"), assignmentController.getAssignmentById);
router.post("/lecturer", authorizeRoles("LECTURER"), validate(validateCreateAssignment), assignmentController.createAssignment);
router.put("/lecturer/:id", authorizeRoles("LECTURER"), validate(validateUpdateAssignment), assignmentController.updateAssignment);
router.delete("/lecturer/:id", authorizeRoles("LECTURER"), assignmentController.deleteAssignment);
router.patch("/lecturer/:id/status", authorizeRoles("LECTURER"), assignmentController.updateAssignmentStatus);
router.get("/lecturer/:assignmentId/submissions", authorizeRoles("LECTURER"), submissionController.getAssignmentSubmissions);

// Relative paths (compatibility for mounting under /lecturer/assignments)
router.get("/:id", authorizeRoles("LECTURER"), assignmentController.getAssignmentById);
router.get("/:assignmentId/submissions", authorizeRoles("LECTURER"), submissionController.getAssignmentSubmissions);
router.put("/:id", authorizeRoles("LECTURER"), validate(validateUpdateAssignment), assignmentController.updateAssignment);
router.delete("/:id", authorizeRoles("LECTURER"), assignmentController.deleteAssignment);
router.patch("/:id/status", authorizeRoles("LECTURER"), assignmentController.updateAssignmentStatus);

module.exports = router;
