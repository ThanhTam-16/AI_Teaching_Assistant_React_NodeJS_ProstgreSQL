const express = require("express");
const notificationController = require("../controllers/notification.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = express.Router();

router.use(authenticate);

// --- STUDENT PATHS ---
router.get("/student", authorizeRoles("STUDENT"), notificationController.getStudentNotifications);
router.patch("/student/read-all", authorizeRoles("STUDENT"), notificationController.markAllAsRead);
router.patch("/student/:id/read", authorizeRoles("STUDENT"), notificationController.markAsRead);

module.exports = router;
