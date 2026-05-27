const express = require("express");

const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const subjectRoutes = require("./subject.routes");
const classRoutes = require("./class.routes");
const dashboardRoutes = require("./dashboard.routes");
const settingRoutes = require("./setting.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/subjects", subjectRoutes);
router.use("/classes", classRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/settings", settingRoutes);

module.exports = router;