const express = require("express");
const classController = require("../controllers/class.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = express.Router();

// All class routes require login and ADMIN role
router.use(authenticate);
router.use(authorizeRoles("ADMIN"));

router.get("/", classController.getClasses);
router.get("/:id", classController.getClassById);

module.exports = router;
