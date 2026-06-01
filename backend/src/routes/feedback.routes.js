const express = require("express");
const feedbackController = require("../controllers/feedback.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = express.Router();

router.use(authenticate);

// --- STUDENT PATHS ---
router.get("/student", authorizeRoles("STUDENT"), feedbackController.getStudentFeedbacks);
router.get("/student/submissions/:submissionId", authorizeRoles("STUDENT"), feedbackController.getStudentFeedbackBySubmissionId);
router.get("/student/assignments/:assignmentId", authorizeRoles("STUDENT"), feedbackController.getStudentFeedbackByAssignmentId);

// Root paths (compatibility for mounting under /lecturer/feedbacks)
router.put("/:id", authorizeRoles("LECTURER"), feedbackController.updateFeedback);
router.delete("/:id", authorizeRoles("LECTURER"), feedbackController.deleteFeedback);

// Module paths (for mounting under /feedbacks)
router.put("/lecturer/:id", authorizeRoles("LECTURER"), feedbackController.updateFeedback);
router.delete("/lecturer/:id", authorizeRoles("LECTURER"), feedbackController.deleteFeedback);

module.exports = router;
