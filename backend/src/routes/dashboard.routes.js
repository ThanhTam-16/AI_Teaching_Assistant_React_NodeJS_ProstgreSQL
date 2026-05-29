const express = require("express");
const dashboardController = require("../controllers/dashboard.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = express.Router();

router.use(authenticate);

const checkRole = (req, res, next) => {
  if (req.baseUrl.includes("/lecturer")) {
    return authorizeRoles("LECTURER")(req, res, next);
  }
  return authorizeRoles("ADMIN")(req, res, next);
};

// Compatibility for mounting under /admin/dashboard or /lecturer/dashboard
router.get("/", checkRole, (req, res, next) => {
  if (req.baseUrl.includes("/lecturer")) {
    return dashboardController.getLecturerStats(req, res, next);
  }
  return dashboardController.getStats(req, res, next);
});

router.get("/overview", checkRole, (req, res, next) => {
  if (req.baseUrl.includes("/lecturer")) {
    return dashboardController.getLecturerStats(req, res, next);
  }
  return dashboardController.getStats(req, res, next);
});

// Module paths (for mounting under /dashboard)
router.get("/admin/overview", authorizeRoles("ADMIN"), dashboardController.getStats);
router.get("/lecturer/overview", authorizeRoles("LECTURER"), dashboardController.getLecturerStats);

module.exports = router;
