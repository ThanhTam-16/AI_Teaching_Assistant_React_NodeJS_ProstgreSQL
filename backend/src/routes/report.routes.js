const express = require("express");
const reportController = require("../controllers/report.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles("LECTURER"));

// Root paths (compatibility for mounting under /lecturer/reports)
router.get("/overview", reportController.getOverviewReport);
router.get("/classes/:classId", reportController.getClassReport);
router.get("/assignments/:assignmentId", reportController.getAssignmentReport);

// Module paths (for mounting under /reports)
router.get("/lecturer/overview", reportController.getOverviewReport);
router.get("/lecturer/classes/:classId", reportController.getClassReport);
router.get("/lecturer/assignments/:assignmentId", reportController.getAssignmentReport);

module.exports = router;
