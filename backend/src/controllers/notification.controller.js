const notificationService = require("../services/notification.service");
const { successResponse } = require("../utils/response");
const { getPaginationParams } = require("../utils/pagination");

const getStudentNotifications = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const studentId = req.user.id;
    const result = await notificationService.getStudentNotifications({ studentId, page, limit, skip });

    return successResponse(res, "Student notifications fetched successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;
    const notification = await notificationService.markAsRead(id, studentId);

    return successResponse(res, "Notification marked as read successfully", notification, 200);
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const result = await notificationService.markAllAsRead(studentId);

    return successResponse(res, "All notifications marked as read successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudentNotifications,
  markAsRead,
  markAllAsRead,
};
