const express = require("express");
const subjectController = require("../controllers/subject.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const { validate } = require("../middlewares/validate.middleware");
const {
  validateCreateSubject,
  validateUpdateSubject,
  validateAssignLecturer,
} = require("../validations/subject.validation");

const router = express.Router();

router.use(authenticate);

const checkRole = (req, res, next) => {
  if (req.baseUrl.includes("/lecturer")) {
    return authorizeRoles("LECTURER")(req, res, next);
  }
  return authorizeRoles("ADMIN")(req, res, next);
};

// --- LIST ENDPOINTS ---
router.get("/", checkRole, (req, res, next) => {
  if (req.baseUrl.includes("/lecturer")) {
    return subjectController.getLecturerSubjects(req, res, next);
  }
  return subjectController.getSubjects(req, res, next);
});

// --- NEW COMPATIBLE PATHS (e.g. /api/subjects/lecturer/...) ---
router.get("/lecturer", authorizeRoles("LECTURER"), subjectController.getLecturerSubjects);
router.get("/lecturer/:id", authorizeRoles("LECTURER"), subjectController.getLecturerSubjectById);
router.get("/lecturer/:id/classes", authorizeRoles("LECTURER"), subjectController.getClassesOfLecturerSubject);
router.get("/lecturer/:id/lessons", authorizeRoles("LECTURER"), subjectController.getLessonsOfLecturerSubject);
router.get("/lecturer/:id/assignments", authorizeRoles("LECTURER"), subjectController.getAssignmentsOfLecturerSubject);

router.get("/admin", authorizeRoles("ADMIN"), subjectController.getSubjects);
router.get("/admin/:id", authorizeRoles("ADMIN"), subjectController.getSubjectById);

// --- DETAILS / ACTIONS (relative to mount) ---
router.get("/:id", checkRole, (req, res, next) => {
  if (req.params.id === "lecturer") {
    return subjectController.getLecturerSubjects(req, res, next);
  }
  if (req.baseUrl.includes("/lecturer")) {
    return subjectController.getLecturerSubjectById(req, res, next);
  }
  return subjectController.getSubjectById(req, res, next);
});

router.post("/", checkRole, (req, res, next) => {
  if (req.baseUrl.includes("/lecturer")) {
    return res.status(403).json({ success: false, message: "Lecturer subject creation not supported" });
  }
  return validate(validateCreateSubject)(req, res, () => {
    return subjectController.createSubject(req, res, next);
  });
});

router.put("/:id", checkRole, (req, res, next) => {
  if (req.baseUrl.includes("/lecturer")) {
    return res.status(403).json({ success: false, message: "Lecturer subject update not supported" });
  }
  return validate(validateUpdateSubject)(req, res, () => {
    return subjectController.updateSubject(req, res, next);
  });
});

router.delete("/:id", checkRole, (req, res, next) => {
  if (req.baseUrl.includes("/lecturer")) {
    return res.status(403).json({ success: false, message: "Lecturer subject deletion not supported" });
  }
  return subjectController.deleteSubject(req, res, next);
});

// Lecturer Assignment endpoints (Admin Only)
router.get("/:id/lecturers", authorizeRoles("ADMIN"), subjectController.getLecturers);
router.post("/:id/lecturers", authorizeRoles("ADMIN"), validate(validateAssignLecturer), subjectController.assignLecturer);
router.delete("/:id/lecturers/:lecturerId", authorizeRoles("ADMIN"), subjectController.removeLecturer);

// Lecturer sub-endpoints mapped relative to mount
router.get("/:id/classes", checkRole, (req, res, next) => {
  if (req.baseUrl.includes("/lecturer")) {
    return subjectController.getClassesOfLecturerSubject(req, res, next);
  }
  return res.status(403).json({ success: false, message: "Admin classes list not supported on this endpoint" });
});

router.get("/:id/lessons", checkRole, (req, res, next) => {
  if (req.baseUrl.includes("/lecturer")) {
    return subjectController.getLessonsOfLecturerSubject(req, res, next);
  }
  return res.status(403).json({ success: false, message: "Admin lessons list not supported on this endpoint" });
});

router.get("/:id/assignments", checkRole, (req, res, next) => {
  if (req.baseUrl.includes("/lecturer")) {
    return subjectController.getAssignmentsOfLecturerSubject(req, res, next);
  }
  return res.status(403).json({ success: false, message: "Admin assignments list not supported on this endpoint" });
});

module.exports = router;
