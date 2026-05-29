const express = require("express");
const cloController = require("../controllers/clo.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { validateCreateCLO, validateUpdateCLO } = require("../validations/clo.validation");

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles("LECTURER"));

// Root mappings (compatibility for mounting under /lecturer/clos)
router.get("/", cloController.getCLOs);
router.post("/", validate(validateCreateCLO), cloController.createCLO);

// Module paths (for mounting under /clos)
router.get("/lecturer", cloController.getCLOs);
router.get("/lecturer/:id", cloController.getCLOById);
router.post("/lecturer", validate(validateCreateCLO), cloController.createCLO);
router.put("/lecturer/:id", validate(validateUpdateCLO), cloController.updateCLO);
router.delete("/lecturer/:id", cloController.deleteCLO);

// ID mappings (compatibility for mounting under /lecturer/clos)
router.get("/:id", cloController.getCLOById);
router.put("/:id", validate(validateUpdateCLO), cloController.updateCLO);
router.delete("/:id", cloController.deleteCLO);

module.exports = router;
