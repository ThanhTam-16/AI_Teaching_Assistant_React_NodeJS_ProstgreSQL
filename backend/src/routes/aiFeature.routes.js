const express = require("express");
const settingController = require("../controllers/setting.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = express.Router();

// All AI features routes require login and ADMIN role
router.use(authenticate);
router.use(authorizeRoles("ADMIN"));

router.get("/", settingController.getAIFeatures);
router.patch("/:id/status", settingController.updateAIFeature);

module.exports = router;
