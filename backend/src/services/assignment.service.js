const prisma = require("../config/database");
const { formatPaginatedResponse } = require("../utils/pagination");

const getAssignments = async ({ page, limit, skip, search, classId, subjectId, status, lecturerId }) => {
  const where = {
    OR: [
      { createdById: lecturerId },
      { class: { lecturerId } },
    ],
  };

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
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
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

  const updatedAssignment = await prisma.assignment.update({
    where: { id },
    data: { status },
  });

  return updatedAssignment;
};

module.exports = {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  updateAssignmentStatus,
};
