const prisma = require("../config/database");
const { formatPaginatedResponse } = require("../utils/pagination");

const getAssignments = async ({ page, limit, skip, search, classId, subjectId, status, lecturerId }) => {
  // Base ownership filter — always applied
  const ownershipFilter = {
    OR: [
      { createdById: lecturerId },
      { class: { lecturerId } },
    ],
  };

  const where = { AND: [ownershipFilter] };

  if (classId) {
    where.classId = classId;
  }

  if (subjectId) {
    where.subjectId = subjectId;
  }

  if (status) {
    where.status = status;
  }

  if (search) {
    // Add search as extra AND condition — does NOT overwrite ownership filter
    where.AND.push({
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  const [assignments, total] = await Promise.all([
    prisma.assignment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        subject: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        lesson: {
          select: {
            id: true,
            title: true,
          },
        },
        clo: {
          select: {
            id: true,
            code: true,
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    }),
    prisma.assignment.count({ where }),
  ]);

  const items = assignments.map((a) => {
    const { _count, ...rest } = a;
    return {
      ...rest,
      submissionCount: _count.submissions,
    };
  });

  return formatPaginatedResponse(items, total, page, limit, "assignments");
};

const getAssignmentById = async (id, lecturerId) => {
  const assignment = await prisma.assignment.findFirst({
    where: {
      id,
      OR: [
        { createdById: lecturerId },
        { class: { lecturerId } },
      ],
    },
    include: {
      class: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      subject: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      lesson: {
        select: {
          id: true,
          title: true,
        },
      },
      clo: {
        select: {
          id: true,
          code: true,
          description: true,
        },
      },
      _count: {
        select: {
          submissions: true,
        },
      },
    },
  });

  if (!assignment) {
    const error = new Error("Assignment not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  return assignment;
};

const createAssignment = async (assignmentData, lecturerId) => {
  const {
    title,
    description,
    requirements,
    dueDate,
    totalScore,
    difficulty,
    submissionType,
    status,
    subjectId,
    classId,
    lessonId,
    cloId,
  } = assignmentData;

  const classItem = await prisma.class.findFirst({
    where: { id: classId, lecturerId },
  });

  if (!classItem) {
    const error = new Error("Class not found or you are not assigned as lecturer of this class");
    error.statusCode = 403;
    throw error;
  }

  const subjectAssigned = await prisma.lecturerSubject.findUnique({
    where: {
      lecturerId_subjectId: {
        lecturerId,
        subjectId,
      },
    },
  });

  if (!subjectAssigned) {
    const classSubject = await prisma.classSubject.findFirst({
      where: {
        classId,
        subjectId,
      },
    });

    if (!classSubject) {
      const error = new Error("Subject is not associated with this class or not assigned to you");
      error.statusCode = 400;
      throw error;
    }
  }

  if (lessonId) {
    const lesson = await prisma.lesson.findFirst({
      where: { id: lessonId, subjectId },
    });
    if (!lesson) {
      const error = new Error("Lesson not found or does not belong to the selected subject");
      error.statusCode = 400;
      throw error;
    }
  }

  if (cloId) {
    const clo = await prisma.cLO.findFirst({
      where: { id: cloId, subjectId },
    });
    if (!clo) {
      const error = new Error("CLO not found or does not belong to the selected subject");
      error.statusCode = 400;
      throw error;
    }
  }

  const newAssignment = await prisma.assignment.create({
    data: {
      title,
      description,
      requirements,
      dueDate: dueDate ? new Date(dueDate) : null,
      totalScore: totalScore !== undefined ? parseFloat(totalScore) : 10,
      difficulty: difficulty || "MEDIUM",
      submissionType: submissionType || "TEXT",
      status: status || "DRAFT",
      subjectId,
      classId,
      lessonId,
      cloId,
      createdById: lecturerId,
    },
  });

  if (newAssignment.status === "ASSIGNED") {
    const notificationService = require("./notification.service");
    await notificationService.notifyClassStudents(classId, {
      type: "ASSIGNMENT",
      title: "Bài tập mới",
      message: `Bạn có bài tập mới: ${title}`,
      relatedUrl: "/student/assignments",
    });
  }

  return newAssignment;
};

const updateAssignment = async (id, assignmentData, lecturerId) => {
  const assignment = await prisma.assignment.findFirst({
    where: {
      id,
      OR: [
        { createdById: lecturerId },
        { class: { lecturerId } },
      ],
    },
  });

  if (!assignment) {
    const error = new Error("Assignment not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  const {
    title,
    description,
    requirements,
    dueDate,
    totalScore,
    difficulty,
    submissionType,
    status,
    lessonId,
    cloId,
  } = assignmentData;

  if (lessonId && lessonId !== assignment.lessonId) {
    const lesson = await prisma.lesson.findFirst({
      where: { id: lessonId, subjectId: assignment.subjectId },
    });
    if (!lesson) {
      const error = new Error("Lesson not found or does not belong to this subject");
      error.statusCode = 400;
      throw error;
    }
  }

  if (cloId && cloId !== assignment.cloId) {
    const clo = await prisma.cLO.findFirst({
      where: { id: cloId, subjectId: assignment.subjectId },
    });
    if (!clo) {
      const error = new Error("CLO not found or does not belong to this subject");
      error.statusCode = 400;
      throw error;
    }
  }

  const oldStatus = assignment.status;
  const updatedAssignment = await prisma.assignment.update({
    where: { id },
    data: {
      title,
      description,
      requirements,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      totalScore: totalScore !== undefined ? parseFloat(totalScore) : undefined,
      difficulty,
      submissionType,
      status,
      lessonId,
      cloId,
    },
  });

  if (updatedAssignment.status === "ASSIGNED") {
    const notificationService = require("./notification.service");
    if (oldStatus === "DRAFT") {
      await notificationService.notifyClassStudents(assignment.classId, {
        type: "ASSIGNMENT",
        title: "Bài tập mới",
        message: `Bạn có bài tập mới: ${updatedAssignment.title}`,
        relatedUrl: "/student/assignments",
      });
    } else if (oldStatus === "ASSIGNED") {
      await notificationService.notifyClassStudents(assignment.classId, {
        type: "ASSIGNMENT",
        title: "Cập nhật bài tập",
        message: `Bài tập ${updatedAssignment.title} vừa được cập nhật`,
        relatedUrl: "/student/assignments",
      });
    }
  }

  return updatedAssignment;
};

const deleteAssignment = async (id, lecturerId) => {
  const assignment = await prisma.assignment.findFirst({
    where: {
      id,
      OR: [
        { createdById: lecturerId },
        { class: { lecturerId } },
      ],
    },
    include: {
      _count: {
        select: {
          submissions: true,
        },
      },
    },
  });

  if (!assignment) {
    const error = new Error("Assignment not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  if (assignment._count.submissions > 0) {
    const error = new Error("Cannot delete assignment because it already has student submissions. Please close or archive it instead.");
    error.statusCode = 400;
    throw error;
  }

  await prisma.assignment.delete({
    where: { id },
  });

  return { id };
};

const updateAssignmentStatus = async (id, status, lecturerId) => {
  const assignment = await prisma.assignment.findFirst({
    where: {
      id,
      OR: [
        { createdById: lecturerId },
        { class: { lecturerId } },
      ],
    },
  });

  if (!assignment) {
    const error = new Error("Assignment not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  if (!["DRAFT", "ASSIGNED", "CLOSED"].includes(status)) {
    const error = new Error("Invalid assignment status");
    error.statusCode = 400;
    throw error;
  }

  const oldStatus = assignment.status;
  const updatedAssignment = await prisma.assignment.update({
    where: { id },
    data: { status },
  });

  if (updatedAssignment.status === "ASSIGNED") {
    const notificationService = require("./notification.service");
    if (oldStatus === "DRAFT") {
      await notificationService.notifyClassStudents(assignment.classId, {
        type: "ASSIGNMENT",
        title: "Bài tập mới",
        message: `Bạn có bài tập mới: ${updatedAssignment.title}`,
        relatedUrl: "/student/assignments",
      });
    } else if (oldStatus === "ASSIGNED") {
      await notificationService.notifyClassStudents(assignment.classId, {
        type: "ASSIGNMENT",
        title: "Cập nhật bài tập",
        message: `Bài tập ${updatedAssignment.title} vừa được cập nhật`,
        relatedUrl: "/student/assignments",
      });
    }
  }

  return updatedAssignment;
};

const getStudentAssignments = async ({ studentId, page, limit, skip, search, classId, subjectId, status }) => {
  const enrollments = await prisma.classEnrollment.findMany({
    where: { studentId },
    select: { classId: true },
  });
  const classIds = enrollments.map((e) => e.classId);

  if (classIds.length === 0) {
    return formatPaginatedResponse([], 0, page, limit, "assignments");
  }

  const where = {
    classId: { in: classIds },
    status: { in: ["ASSIGNED", "CLOSED"] },
  };

  if (classId) {
    if (!classIds.includes(classId)) {
      const error = new Error("Access denied to this class assignments");
      error.statusCode = 403;
      throw error;
    }
    where.classId = classId;
  }

  if (subjectId) {
    where.subjectId = subjectId;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  // Handle custom status filters
  if (status) {
    if (status === "submitted") {
      where.submissions = {
        some: {
          studentId,
          status: { in: ["SUBMITTED", "LATE", "GRADED", "NEED_REVIEW"] },
        },
      };
    } else if (status === "not_submitted") {
      where.submissions = {
        none: {
          studentId,
        },
      };
      where.status = "ASSIGNED";
    } else if (status === "graded") {
      where.submissions = {
        some: {
          studentId,
          status: "GRADED",
        },
      };
    } else if (status === "upcoming") {
      where.status = "ASSIGNED";
      where.dueDate = { gte: new Date() };
    } else if (status === "overdue") {
      where.status = "ASSIGNED";
      where.dueDate = { lt: new Date() };
      where.submissions = {
        none: {
          studentId,
        },
      };
    } else if (["ASSIGNED", "CLOSED"].includes(status)) {
      where.status = status;
    }
  }

  const [assignments, total] = await Promise.all([
    prisma.assignment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { dueDate: "asc" },
      include: {
        subject: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        class: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        lesson: {
          select: {
            id: true,
            title: true,
          },
        },
        submissions: {
          where: { studentId },
          include: {
            grade: {
              select: {
                score: true,
                note: true,
              },
            },
          },
        },
      },
    }),
    prisma.assignment.count({ where }),
  ]);

  const items = assignments.map((a) => {
    const { submissions, ...rest } = a;
    const mySubmission = submissions[0] || null;
    return {
      ...rest,
      mySubmission,
      submissionStatus: mySubmission ? mySubmission.status : "NOT_SUBMITTED",
    };
  });

  return formatPaginatedResponse(items, total, page, limit, "assignments");
};

const getStudentAssignmentById = async (id, studentId) => {
  const enrollments = await prisma.classEnrollment.findMany({
    where: { studentId },
    select: { classId: true },
  });
  const classIds = enrollments.map((e) => e.classId);

  const assignment = await prisma.assignment.findFirst({
    where: {
      id,
      classId: { in: classIds },
      status: { in: ["ASSIGNED", "CLOSED"] },
    },
    include: {
      subject: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      class: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      lesson: {
        select: {
          id: true,
          title: true,
        },
      },
      clo: {
        select: {
          id: true,
          code: true,
          description: true,
        },
      },
      submissions: {
        where: { studentId },
        include: {
          grade: true,
          feedbacks: {
            include: {
              lecturer: {
                select: {
                  fullName: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!assignment) {
    const error = new Error("Assignment not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  const { submissions, ...rest } = assignment;
  const mySubmission = submissions[0] || null;

  return {
    ...rest,
    mySubmission,
    submissionStatus: mySubmission ? mySubmission.status : "NOT_SUBMITTED",
  };
};

const getStudentAssignmentMySubmission = async (id, studentId) => {
  const enrollments = await prisma.classEnrollment.findMany({
    where: { studentId },
    select: { classId: true },
  });
  const classIds = enrollments.map((e) => e.classId);

  const assignment = await prisma.assignment.findFirst({
    where: {
      id,
      classId: { in: classIds },
      status: { in: ["ASSIGNED", "CLOSED"] },
    },
  });

  if (!assignment) {
    const error = new Error("Assignment not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  const submission = await prisma.submission.findUnique({
    where: {
      assignmentId_studentId: {
        assignmentId: id,
        studentId,
      },
    },
    include: {
      grade: true,
      feedbacks: {
        orderBy: { createdAt: "desc" },
        include: {
          lecturer: {
            select: {
              fullName: true,
            },
          },
        },
      },
    },
  });

  return submission || null;
};

module.exports = {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  updateAssignmentStatus,
  getStudentAssignments,
  getStudentAssignmentById,
  getStudentAssignmentMySubmission,
};
