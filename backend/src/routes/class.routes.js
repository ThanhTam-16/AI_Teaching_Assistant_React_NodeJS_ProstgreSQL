const express = require("express");
const classController = require("../controllers/class.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

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
    return classController.getLecturerClasses(req, res, next);
  }
  return classController.getClasses(req, res, next);
});

// --- NEW COMPATIBLE PATHS (e.g. /api/classes/lecturer/...) ---
router.get("/lecturer", authorizeRoles("LECTURER"), classController.getLecturerClasses);
router.get("/lecturer/:id", authorizeRoles("LECTURER"), classController.getLecturerClassById);
router.post("/lecturer", authorizeRoles("LECTURER"), classController.createClassByLecturer);
router.put("/lecturer/:id", authorizeRoles("LECTURER"), classController.updateClassByLecturer);
router.patch("/lecturer/:id/status", authorizeRoles("LECTURER"), classController.updateClassStatusByLecturer);
router.get("/lecturer/:id/students", authorizeRoles("LECTURER"), classController.getStudentsInClass);
router.post("/lecturer/:id/students", authorizeRoles("LECTURER"), classController.addStudentToClass);
router.delete("/lecturer/:id/students/:studentId", authorizeRoles("LECTURER"), classController.removeStudentFromClass);
router.get("/lecturer/:id/progress", authorizeRoles("LECTURER"), classController.getLecturerClassProgress);
router.get("/lecturer/:id/students/:studentId/progress", authorizeRoles("LECTURER"), classController.getStudentProgressInClass);

router.get("/admin", authorizeRoles("ADMIN"), classController.getClasses);
router.get("/admin/:id", authorizeRoles("ADMIN"), classController.getClassById);

// --- STUDENT PATHS ---
router.get("/student", authorizeRoles("STUDENT"), classController.getStudentClasses);
router.get("/student/:id", authorizeRoles("STUDENT"), classController.getStudentClassById);

// --- DETAILS / ACTIONS (relative to mount) ---
router.get("/:id", checkRole, (req, res, next) => {
  if (req.params.id === "lecturer") {
    return classController.getLecturerClasses(req, res, next);
  }
  if (req.baseUrl.includes("/lecturer")) {
    return classController.getLecturerClassById(req, res, next);
  }
  return classController.getClassById(req, res, next);
});

router.post("/", checkRole, (req, res, next) => {
  if (req.baseUrl.includes("/lecturer")) {
    return classController.createClassByLecturer(req, res, next);
  }
  return res.status(403).json({ success: false, message: "Admin class creation not supported" });
});

router.put("/:id", checkRole, (req, res, next) => {
  if (req.baseUrl.includes("/lecturer")) {
    return classController.updateClassByLecturer(req, res, next);
  }
  return res.status(403).json({ success: false, message: "Admin class update not supported" });
});

router.patch("/:id/status", checkRole, (req, res, next) => {
  if (req.baseUrl.includes("/lecturer")) {
    return classController.updateClassStatusByLecturer(req, res, next);
  }
  return res.status(403).json({ success: false, message: "Admin class status patch not supported" });
});

router.get("/:id/students", checkRole, (req, res, next) => {
  if (req.baseUrl.includes("/lecturer")) {
    return classController.getStudentsInClass(req, res, next);
  }
  return res.status(403).json({ success: false, message: "Admin students query not supported" });
});

router.post("/:id/students", checkRole, (req, res, next) => {
  if (req.baseUrl.includes("/lecturer")) {
    return classController.addStudentToClass(req, res, next);
  }
  return res.status(403).json({ success: false, message: "Admin students edit not supported" });
});

router.delete("/:id/students/:studentId", checkRole, (req, res, next) => {
  if (req.baseUrl.includes("/lecturer")) {
    return classController.removeStudentFromClass(req, res, next);
  }
  return res.status(403).json({ success: false, message: "Admin student removal not supported" });
});

router.get("/:id/progress", checkRole, (req, res, next) => {
  if (req.baseUrl.includes("/lecturer")) {
    return classController.getLecturerClassProgress(req, res, next);
  }
  return res.status(403).json({ success: false, message: "Admin progress query not supported" });
});

router.get("/:id/students/:studentId/progress", checkRole, (req, res, next) => {
  if (req.baseUrl.includes("/lecturer")) {
    return classController.getStudentProgressInClass(req, res, next);
  }
  return res.status(403).json({ success: false, message: "Admin student progress query not supported" });
});


module.exports = router;
