const express = require("express");
const reportController = require("../controllers/report.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = express.Router();

router.use(authenticate);

// --- STUDENT PATHS ---
router.get("/student/progress", authorizeRoles("STUDENT"), reportController.getStudentProgress);
router.get("/student/subjects/:subjectId/progress", authorizeRoles("STUDENT"), reportController.getStudentSubjectProgress);
router.get("/student/classes/:classId/progress", authorizeRoles("STUDENT"), reportController.getStudentClassProgress);

// Root paths (compatibility for mounting under /lecturer/reports)
router.get("/overview", authorizeRoles("LECTURER"), reportController.getOverviewReport);
router.get("/classes/:classId", authorizeRoles("LECTURER"), reportController.getClassReport);
router.get("/assignments/:assignmentId", authorizeRoles("LECTURER"), reportController.getAssignmentReport);

// Module paths (for mounting under /reports)
router.get("/lecturer/overview", authorizeRoles("LECTURER"), reportController.getOverviewReport);
router.get("/lecturer/classes/:classId", authorizeRoles("LECTURER"), reportController.getClassReport);
router.get("/lecturer/assignments/:assignmentId", authorizeRoles("LECTURER"), reportController.getAssignmentReport);

module.exports = router;
