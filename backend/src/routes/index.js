const express = require("express");

const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const classRoutes = require("./class.routes");
const subjectRoutes = require("./subject.routes");
const cloRoutes = require("./clo.routes");
const lessonRoutes = require("./lesson.routes");
const assignmentRoutes = require("./assignment.routes");
const submissionRoutes = require("./submission.routes");
const gradeRoutes = require("./grade.routes");
const feedbackRoutes = require("./feedback.routes");
const quizRoutes = require("./quiz.routes");
const aiRoutes = require("./ai.routes");
const dashboardRoutes = require("./dashboard.routes");
const reportRoutes = require("./report.routes");
const settingRoutes = require("./setting.routes");
const notificationRoutes = require("./notification.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);

// Module-based routing (new preferred paths)
router.use("/classes", classRoutes);
router.use("/subjects", subjectRoutes);
router.use("/clos", cloRoutes);
router.use("/lessons", lessonRoutes);
router.use("/assignments", assignmentRoutes);
router.use("/submissions", submissionRoutes);
router.use("/grades", gradeRoutes);
router.use("/feedbacks", feedbackRoutes);
router.use("/quizzes", quizRoutes);
router.use("/ai", aiRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/reports", reportRoutes);
router.use("/notifications", notificationRoutes);

// Admin-specific paths matching original frontend calls
router.use("/admin/dashboard", dashboardRoutes);
router.use("/admin/ai-features", aiRoutes);
router.use("/admin/settings", settingRoutes);

// Lecturer legacy compatibility paths
router.use("/lecturer/classes", classRoutes);
router.use("/lecturer/subjects", subjectRoutes);
router.use("/lecturer/clos", cloRoutes);
router.use("/lecturer/lessons", lessonRoutes);
router.use("/lecturer/assignments", assignmentRoutes);
router.use("/lecturer/submissions", submissionRoutes);
router.use("/lecturer/feedbacks", feedbackRoutes);
router.use("/lecturer/ai", aiRoutes);
router.use("/lecturer/quizzes", quizRoutes);
router.use("/lecturer/reports", reportRoutes);
router.use("/lecturer/dashboard", dashboardRoutes);

module.exports = router;