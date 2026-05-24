const express = require("express");

const authController = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = express.Router();

router.post("/login", authController.login);

router.post("/logout", authenticate, authController.logout);

router.get("/me", authenticate, authController.getMe);

router.get(
  "/check-admin",
  authenticate,
  authorizeRoles("ADMIN"),
  authController.checkAdmin
);

router.get(
  "/check-lecturer",
  authenticate,
  authorizeRoles("LECTURER"),
  authController.checkLecturer
);

router.get(
  "/check-student",
  authenticate,
  authorizeRoles("STUDENT"),
  authController.checkStudent
);

module.exports = router;