const express = require("express");
const settingController = require("../controllers/setting.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const { validate } = require("../middlewares/validate.middleware");
const {
  validateUpdateAIFeature,
  validateUpdateSystemSetting,
} = require("../validations/setting.validation");

const router = express.Router();

// All settings routes require login and ADMIN role
router.use(authenticate);
router.use(authorizeRoles("ADMIN"));

router.get("/ai", settingController.getAIFeatures);
router.put("/ai/:key", validate(validateUpdateAIFeature), settingController.updateAIFeature);

router.get("/system", settingController.getSystemSettings);
router.put("/system/:key", validate(validateUpdateSystemSetting), settingController.updateSystemSetting);

module.exports = router;
