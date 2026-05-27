const express = require("express");
const dashboardController = require("../controllers/dashboard.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = express.Router();

// All dashboard routes require login and ADMIN role
router.use(authenticate);
router.use(authorizeRoles("ADMIN"));

router.get("/stats", dashboardController.getStats);

module.exports = router;
