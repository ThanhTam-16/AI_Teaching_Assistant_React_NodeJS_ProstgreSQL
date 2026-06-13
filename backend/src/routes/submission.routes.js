const express = require("express");
const submissionController = require("../controllers/submission.controller");
const gradeController = require("../controllers/grade.controller");
const feedbackController = require("../controllers/feedback.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { validateSubmitSubmission } = require("../validations/submission.validation");

const router = express.Router();

router.use(authenticate);

// --- STUDENT PATHS ---
router.post("/student/assignments/:assignmentId", authorizeRoles("STUDENT"), validate(validateSubmitSubmission), submissionController.submitAssignment);
router.put("/student/:submissionId", authorizeRoles("STUDENT"), validate(validateSubmitSubmission), submissionController.updateSubmission);
router.get("/student", authorizeRoles("STUDENT"), submissionController.getStudentSubmissions);
router.get("/student/:id", authorizeRoles("STUDENT"), submissionController.getStudentSubmissionById);

// --- LECTURER PATHS ---
// IMPORTANT: /lecturer* routes MUST come before /:id to avoid Express shadowing
// e.g. GET /submissions/lecturer would match /:id='lecturer' if order is wrong

// List & detail (module mounting under /submissions)
router.get("/lecturer", authorizeRoles("LECTURER"), submissionController.getSubmissions);
router.get("/lecturer/:id", authorizeRoles("LECTURER"), submissionController.getSubmissionById);

// Grading (module mounting under /submissions)
router.post("/lecturer/:submissionId/grade", authorizeRoles("LECTURER"), gradeController.gradeSubmission);
router.put("/lecturer/:submissionId/grade", authorizeRoles("LECTURER"), gradeController.gradeSubmission);

// Feedback (module mounting under /submissions)
router.get("/lecturer/:submissionId/feedbacks", authorizeRoles("LECTURER"), feedbackController.getSubmissionsFeedbacks);
router.post("/lecturer/:submissionId/feedbacks", authorizeRoles("LECTURER"), feedbackController.createSubmissionFeedback);

// Root paths (compatibility for mounting under /lecturer/submissions)
router.get("/", authorizeRoles("LECTURER"), submissionController.getSubmissions);
router.get("/:id", authorizeRoles("LECTURER"), submissionController.getSubmissionById);
router.post("/:submissionId/grade", authorizeRoles("LECTURER"), gradeController.gradeSubmission);
router.put("/:submissionId/grade", authorizeRoles("LECTURER"), gradeController.gradeSubmission);
router.get("/:submissionId/feedbacks", authorizeRoles("LECTURER"), feedbackController.getSubmissionsFeedbacks);
router.post("/:submissionId/feedbacks", authorizeRoles("LECTURER"), feedbackController.createSubmissionFeedback);

module.exports = router;
