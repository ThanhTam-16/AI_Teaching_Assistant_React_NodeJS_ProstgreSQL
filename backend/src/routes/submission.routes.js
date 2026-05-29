const express = require("express");
const submissionController = require("../controllers/submission.controller");
const gradeController = require("../controllers/grade.controller");
const feedbackController = require("../controllers/feedback.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles("LECTURER"));

// Root paths (compatibility for mounting under /lecturer/submissions)
router.get("/", submissionController.getSubmissions);
router.get("/:id", submissionController.getSubmissionById);

// Module paths (for mounting under /submissions)
router.get("/lecturer", submissionController.getSubmissions);
router.get("/lecturer/:id", submissionController.getSubmissionById);

// Grading endpoints
router.post("/lecturer/:submissionId/grade", gradeController.gradeSubmission);
router.put("/lecturer/:submissionId/grade", gradeController.gradeSubmission);
router.post("/:submissionId/grade", gradeController.gradeSubmission);
router.put("/:submissionId/grade", gradeController.gradeSubmission);

// Feedback endpoints
router.get("/lecturer/:submissionId/feedbacks", feedbackController.getSubmissionsFeedbacks);
router.post("/lecturer/:submissionId/feedbacks", feedbackController.createSubmissionFeedback);
router.get("/:submissionId/feedbacks", feedbackController.getSubmissionsFeedbacks);
router.post("/:submissionId/feedbacks", feedbackController.createSubmissionFeedback);

module.exports = router;
