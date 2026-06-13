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

const createNotificationForUser = async (userId, { type, title, message, relatedUrl }) => {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        type: type || "SYSTEM",
        title,
        message,
        relatedUrl,
        isRead: false,
      },
    });
  } catch (error) {
    console.error("Error creating notification for user:", error);
  }
};

const notifyClassStudents = async (classId, { type, title, message, relatedUrl }) => {
  try {
    const enrollments = await prisma.classEnrollment.findMany({
      where: { classId },
      select: { studentId: true },
    });

    const studentIds = enrollments.map((e) => e.studentId);
    if (studentIds.length === 0) return [];

    await prisma.notification.createMany({
      data: studentIds.map((studentId) => ({
        userId: studentId,
        type: type || "SYSTEM",
        title,
        message,
        relatedUrl,
        isRead: false,
      })),
    });

    return studentIds;
  } catch (error) {
    console.error("Error creating notifications for class students:", error);
    return [];
  }
};

const getLecturerNotifications = async ({ lecturerId, page, limit, skip }) => {
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: lecturerId },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.notification.count({
      where: { userId: lecturerId },
    }),
  ]);

  return formatPaginatedResponse(notifications, total, page, limit, "notifications");
};

module.exports = {
  getStudentNotifications,
  markAsRead,
  markAllAsRead,
  createNotificationForUser,
  notifyClassStudents,
  getLecturerNotifications,
};
