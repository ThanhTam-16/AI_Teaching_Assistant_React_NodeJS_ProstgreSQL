const authService = require("../services/auth.service");
const { successResponse } = require("../utils/response");

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);

    return successResponse(res, "Login successful", result, 200);
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);

    return successResponse(res, "Current user fetched successfully", user, 200);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    return successResponse(res, "Logout successful", null, 200);
  } catch (error) {
    next(error);
  }
};

const checkAdmin = async (req, res, next) => {
  try {
    return successResponse(res, "Admin access granted", req.user, 200);
  } catch (error) {
    next(error);
  }
};

const checkLecturer = async (req, res, next) => {
  try {
    return successResponse(res, "Lecturer access granted", req.user, 200);
  } catch (error) {
    next(error);
  }
};

const checkStudent = async (req, res, next) => {
  try {
    return successResponse(res, "Student access granted", req.user, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getMe,
  logout,
  checkAdmin,
  checkLecturer,
  checkStudent,
};