const express = require("express");
const gradeController = require("../controllers/grade.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles("LECTURER"));

// Module paths (for mounting under /grades)
router.post("/lecturer/:submissionId", gradeController.gradeSubmission);
router.put("/lecturer/:submissionId", gradeController.gradeSubmission);

// Relative paths (compatibility for mounting under /lecturer/grades)
router.post("/:submissionId", gradeController.gradeSubmission);
router.put("/:submissionId", gradeController.gradeSubmission);

module.exports = router;
