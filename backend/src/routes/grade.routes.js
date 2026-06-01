const express = require("express");
const gradeController = require("../controllers/grade.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = express.Router();

router.use(authenticate);

// --- STUDENT PATHS ---
router.get("/student", authorizeRoles("STUDENT"), gradeController.getStudentGrades);
router.get("/student/submissions/:submissionId", authorizeRoles("STUDENT"), gradeController.getStudentGradeBySubmissionId);
router.get("/student/assignments/:assignmentId", authorizeRoles("STUDENT"), gradeController.getStudentGradeByAssignmentId);

// Module paths (for mounting under /grades)
router.post("/lecturer/:submissionId", authorizeRoles("LECTURER"), gradeController.gradeSubmission);
router.put("/lecturer/:submissionId", authorizeRoles("LECTURER"), gradeController.gradeSubmission);

// Relative paths (compatibility for mounting under /lecturer/grades)
router.post("/:submissionId", authorizeRoles("LECTURER"), gradeController.gradeSubmission);
router.put("/:submissionId", authorizeRoles("LECTURER"), gradeController.gradeSubmission);

module.exports = router;
