const express = require("express");
const userController = require("../controllers/user.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { validateCreateUser, validateUpdateUser } = require("../validations/user.validation");

const router = express.Router();

// All user management routes require login and ADMIN role
router.use(authenticate);
router.use(authorizeRoles("ADMIN"));

router.get("/", userController.getUsers);
router.get("/:id", userController.getUserById);
router.post("/", validate(validateCreateUser), userController.createUser);
router.put("/:id", validate(validateUpdateUser), userController.updateUser);
router.patch("/:id/status", userController.updateUserStatus);
router.delete("/:id", userController.deleteUser);

module.exports = router;
