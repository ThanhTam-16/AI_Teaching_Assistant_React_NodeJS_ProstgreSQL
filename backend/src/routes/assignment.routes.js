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
router.use(authorizeRoles("LECTURER"));

// Root paths (compatibility for mounting under /lecturer/assignments)
router.get("/", assignmentController.getAssignments);
router.post("/", validate(validateCreateAssignment), assignmentController.createAssignment);

// Module paths (for mounting under /assignments)
router.get("/lecturer", assignmentController.getAssignments);
router.get("/lecturer/:id", assignmentController.getAssignmentById);
router.post("/lecturer", validate(validateCreateAssignment), assignmentController.createAssignment);
router.put("/lecturer/:id", validate(validateUpdateAssignment), assignmentController.updateAssignment);
router.delete("/lecturer/:id", assignmentController.deleteAssignment);
router.patch("/lecturer/:id/status", assignmentController.updateAssignmentStatus);
router.get("/lecturer/:assignmentId/submissions", submissionController.getAssignmentSubmissions);

// Relative paths (compatibility for mounting under /lecturer/assignments)
router.get("/:id", assignmentController.getAssignmentById);
router.get("/:assignmentId/submissions", submissionController.getAssignmentSubmissions);
router.put("/:id", validate(validateUpdateAssignment), assignmentController.updateAssignment);
router.delete("/:id", assignmentController.deleteAssignment);
router.patch("/:id/status", assignmentController.updateAssignmentStatus);

module.exports = router;
