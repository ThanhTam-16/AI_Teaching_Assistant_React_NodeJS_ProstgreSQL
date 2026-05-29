const express = require("express");
const feedbackController = require("../controllers/feedback.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles("LECTURER"));

// Root paths (compatibility for mounting under /lecturer/feedbacks)
router.put("/:id", feedbackController.updateFeedback);
router.delete("/:id", feedbackController.deleteFeedback);

// Module paths (for mounting under /feedbacks)
router.put("/lecturer/:id", feedbackController.updateFeedback);
router.delete("/lecturer/:id", feedbackController.deleteFeedback);

module.exports = router;
