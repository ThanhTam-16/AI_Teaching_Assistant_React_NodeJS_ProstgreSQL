const prisma = require("../config/database");
const { formatPaginatedResponse } = require("../utils/pagination");

const getStudentNotifications = async ({ studentId, page, limit, skip }) => {
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: studentId },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.notification.count({
      where: { userId: studentId },
    }),
  ]);

  return formatPaginatedResponse(notifications, total, page, limit, "notifications");
};

const markAsRead = async (id, studentId) => {
  const notification = await prisma.notification.findFirst({
    where: { id, userId: studentId },
  });

  if (!notification) {
    const error = new Error("Notification not found");
    error.statusCode = 404;
    throw error;
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });

  return updated;
};

const markAllAsRead = async (studentId) => {
  const result = await prisma.notification.updateMany({
    where: { userId: studentId, isRead: false },
    data: { isRead: true },
  });

  return { count: result.count };
};

module.exports = {
  getStudentNotifications,
  markAsRead,
  markAllAsRead,
};
