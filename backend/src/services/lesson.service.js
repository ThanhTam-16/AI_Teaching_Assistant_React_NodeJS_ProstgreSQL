const prisma = require("../config/database");
const { formatPaginatedResponse } = require("../utils/pagination");

const getLessons = async ({ page, limit, skip, search, subjectId, status, lecturerId }) => {
  const where = {
    subject: {
      lecturerSubjects: {
        some: { lecturerId },
      },
    },
  };

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

  const [lessons, total] = await Promise.all([
    prisma.lesson.findMany({
      where,
      skip,
      take: limit,
      orderBy: { chapter: "asc" },
      include: {
        subject: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        clo: {
          select: {
            id: true,
            code: true,
            description: true,
          },
        },
      },
    }),
    prisma.lesson.count({ where }),
  ]);

  return formatPaginatedResponse(lessons, total, page, limit, "lessons");
};

const getLessonById = async (id, lecturerId) => {
  const lesson = await prisma.lesson.findFirst({
    where: {
      id,
      subject: {
        lecturerSubjects: {
          some: { lecturerId },
        },
      },
    },
    include: {
      subject: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      clo: {
        select: {
          id: true,
          code: true,
          description: true,
        },
      },
      materials: true,
    },
  });

  if (!lesson) {
    const error = new Error("Lesson not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  return lesson;
};

const createLesson = async (lessonData, lecturerId) => {
  const { title, chapter, description, content, status, subjectId, cloId } = lessonData;

  const assignment = await prisma.lecturerSubject.findUnique({
    where: {
      lecturerId_subjectId: {
        lecturerId,
        subjectId,
      },
    },
  });

  if (!assignment) {
    const error = new Error("Subject access denied or lecturer not assigned to this subject");
    error.statusCode = 403;
    throw error;
  }

  if (cloId) {
    const clo = await prisma.cLO.findFirst({
      where: { id: cloId, subjectId },
    });
    if (!clo) {
      const error = new Error("CLO not found or does not belong to this subject");
      error.statusCode = 400;
      throw error;
    }
  }

  const newLesson = await prisma.lesson.create({
    data: {
      title,
      chapter,
      description,
      content,
      status: status || "DRAFT",
      subjectId,
      cloId,
      createdById: lecturerId,
    },
  });

  return newLesson;
};

const updateLesson = async (id, lessonData, lecturerId) => {
  const lesson = await prisma.lesson.findFirst({
    where: {
      id,
      subject: {
        lecturerSubjects: {
          some: { lecturerId },
        },
      },
    },
  });

  if (!lesson) {
    const error = new Error("Lesson not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  const { title, chapter, description, content, status, cloId } = lessonData;

  if (cloId) {
    const clo = await prisma.cLO.findFirst({
      where: { id: cloId, subjectId: lesson.subjectId },
    });
    if (!clo) {
      const error = new Error("CLO not found or does not belong to the subject of this lesson");
      error.statusCode = 400;
      throw error;
    }
  }

  const oldStatus = lesson.status;
  const updatedLesson = await prisma.lesson.update({
    where: { id },
    data: {
      title,
      chapter,
      description,
      content,
      status,
      cloId,
    },
  });

  if (oldStatus === "DRAFT" && status === "PUBLISHED") {
    await notifyPublishedLesson(id, updatedLesson.title, lesson.subjectId, lecturerId);
  }

  return updatedLesson;
};

const deleteLesson = async (id, lecturerId) => {
  const lesson = await prisma.lesson.findFirst({
    where: {
      id,
      subject: {
        lecturerSubjects: {
          some: { lecturerId },
        },
      },
    },
    include: {
      _count: {
        select: {
          assignments: true,
        },
      },
    },
  });

  if (!lesson) {
    const error = new Error("Lesson not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  if (lesson._count.assignments > 0) {
    const error = new Error("Cannot delete lesson because it is linked to assignments. Please archive it or delete the assignments first.");
    error.statusCode = 400;
    throw error;
  }

  await prisma.lesson.delete({
    where: { id },
  });

  return { id };
};

const updateLessonStatus = async (id, status, lecturerId) => {
  const lesson = await prisma.lesson.findFirst({
    where: {
      id,
      subject: {
        lecturerSubjects: {
          some: { lecturerId },
        },
      },
    },
  });

  if (!lesson) {
    const error = new Error("Lesson not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  if (!["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)) {
    const error = new Error("Invalid status value");
    error.statusCode = 400;
    throw error;
  }

  const oldStatus = lesson.status;
  const updatedLesson = await prisma.lesson.update({
    where: { id },
    data: { status },
  });

  if (oldStatus === "DRAFT" && status === "PUBLISHED") {
    await notifyPublishedLesson(id, updatedLesson.title, lesson.subjectId, lecturerId);
  }

  return updatedLesson;
};

const addLessonMaterial = async (lessonId, materialData, lecturerId) => {
  const lesson = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
      subject: {
        lecturerSubjects: {
          some: { lecturerId },
        },
      },
    },
  });

  if (!lesson) {
    const error = new Error("Lesson not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  const { fileName, fileUrl, fileType } = materialData;

  const material = await prisma.lessonMaterial.create({
    data: {
      fileName,
      fileUrl,
      fileType,
      lessonId,
    },
  });

  return material;
};

const getLessonMaterials = async (lessonId, lecturerId) => {
  const lesson = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
      subject: {
        lecturerSubjects: {
          some: { lecturerId },
        },
      },
    },
  });

  if (!lesson) {
    const error = new Error("Lesson not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  const materials = await prisma.lessonMaterial.findMany({
    where: { lessonId },
    orderBy: { uploadedAt: "desc" },
  });

  return materials;
};

const deleteLessonMaterial = async (lessonId, materialId, lecturerId) => {
  const lesson = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
      subject: {
        lecturerSubjects: {
          some: { lecturerId },
        },
      },
    },
  });

  if (!lesson) {
    const error = new Error("Lesson not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  const material = await prisma.lessonMaterial.findFirst({
    where: { id: materialId, lessonId },
  });

  if (!material) {
    const error = new Error("Material not found in this lesson");
    error.statusCode = 404;
    throw error;
  }

  await prisma.lessonMaterial.delete({
    where: { id: materialId },
  });

  return { lessonId, materialId };
};

const getStudentLessons = async ({ studentId, page, limit, skip, search, subjectId }) => {
  const enrollments = await prisma.classEnrollment.findMany({
    where: { studentId },
    select: { classId: true },
  });
  const classIds = enrollments.map((e) => e.classId);

  const classSubjects = await prisma.classSubject.findMany({
    where: { classId: { in: classIds } },
    select: { subjectId: true },
  });
  const subjectIds = [...new Set(classSubjects.map((cs) => cs.subjectId))];

  if (subjectIds.length === 0) {
    return formatPaginatedResponse([], 0, page, limit, "lessons");
  }

  const where = {
    status: "PUBLISHED",
    subjectId: { in: subjectIds },
  };

  if (subjectId) {
    if (!subjectIds.includes(subjectId)) {
      const error = new Error("Access denied to this subject's lessons");
      error.statusCode = 403;
      throw error;
    }
    where.subjectId = subjectId;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [lessons, total] = await Promise.all([
    prisma.lesson.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { subjectId: "asc" },
        { chapter: "asc" },
      ],
      include: {
        subject: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        clo: {
          select: {
            id: true,
            code: true,
          },
        },
      },
    }),
    prisma.lesson.count({ where }),
  ]);

  return formatPaginatedResponse(lessons, total, page, limit, "lessons");
};

const getStudentLessonById = async (id, studentId) => {
  const enrollments = await prisma.classEnrollment.findMany({
    where: { studentId },
    select: { classId: true },
  });
  const classIds = enrollments.map((e) => e.classId);

  const lesson = await prisma.lesson.findFirst({
    where: {
      id,
      status: "PUBLISHED",
      subject: {
        classSubjects: {
          some: {
            classId: { in: classIds },
          },
        },
      },
    },
    include: {
      subject: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      clo: {
        select: {
          id: true,
          code: true,
          description: true,
        },
      },
      materials: true,
    },
  });

  if (!lesson) {
    const error = new Error("Lesson not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  return lesson;
};

const getStudentLessonMaterials = async (lessonId, studentId) => {
  const enrollments = await prisma.classEnrollment.findMany({
    where: { studentId },
    select: { classId: true },
  });
  const classIds = enrollments.map((e) => e.classId);

  const lesson = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
      status: "PUBLISHED",
      subject: {
        classSubjects: {
          some: {
            classId: { in: classIds },
          },
        },
      },
    },
  });

  if (!lesson) {
    const error = new Error("Lesson not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  const materials = await prisma.lessonMaterial.findMany({
    where: { lessonId },
    orderBy: { uploadedAt: "desc" },
  });

  return materials;
};

const getStudentLessonAssignments = async (lessonId, studentId) => {
  const enrollments = await prisma.classEnrollment.findMany({
    where: { studentId },
    select: { classId: true },
  });
  const classIds = enrollments.map((e) => e.classId);

  const lesson = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
      status: "PUBLISHED",
      subject: {
        classSubjects: {
          some: {
            classId: { in: classIds },
          },
        },
      },
    },
  });

  if (!lesson) {
    const error = new Error("Lesson not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  const assignments = await prisma.assignment.findMany({
    where: {
      lessonId,
      classId: { in: classIds },
      status: { in: ["ASSIGNED", "CLOSED"] },
    },
    orderBy: { dueDate: "asc" },
  });

  return assignments;
};

const notifyPublishedLesson = async (lessonId, lessonTitle, subjectId, lecturerId) => {
  try {
    const classSubjects = await prisma.classSubject.findMany({
      where: {
        subjectId,
        class: {
          lecturerId,
        },
      },
      select: {
        classId: true,
      },
    });

    const classIds = classSubjects.map((cs) => cs.classId);
    if (classIds.length === 0) return;

    const enrollments = await prisma.classEnrollment.findMany({
      where: {
        classId: { in: classIds },
      },
      select: {
        studentId: true,
      },
    });

    const studentIds = [...new Set(enrollments.map((e) => e.studentId))];
    if (studentIds.length === 0) return;

    await prisma.notification.createMany({
      data: studentIds.map((studentId) => ({
        userId: studentId,
        type: "SYSTEM",
        title: "Bài học mới",
        message: `Bạn có bài học mới: ${lessonTitle}`,
        relatedUrl: "/student/lessons",
        isRead: false,
      })),
    });
  } catch (error) {
    console.error("Error in notifyPublishedLesson:", error);
  }
};

module.exports = {
  getLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  updateLessonStatus,
  addLessonMaterial,
  getLessonMaterials,
  deleteLessonMaterial,
  getStudentLessons,
  getStudentLessonById,
  getStudentLessonMaterials,
  getStudentLessonAssignments,
  notifyPublishedLesson,
};
