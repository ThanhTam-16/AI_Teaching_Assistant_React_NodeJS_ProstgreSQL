const prisma = require("../config/database");
const { formatPaginatedResponse } = require("../utils/pagination");

const getSubjects = async ({ page, limit, skip, search }) => {
  const where = {};

  if (search) {
    where.OR = [
      { code: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
    ];
  }

  const [subjects, total] = await Promise.all([
    prisma.subject.findMany({
      where,
      skip,
      take: limit,
      orderBy: { code: "asc" },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    }),
    prisma.subject.count({ where }),
  ]);

  return formatPaginatedResponse(subjects, total, page, limit, "subjects");
};

const getSubjectById = async (id) => {
  const subject = await prisma.subject.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });

  if (!subject) {
    const error = new Error("Subject not found");
    error.statusCode = 404;
    throw error;
  }

  return subject;
};

const createSubject = async (subjectData, creatorId) => {
  const { code, name, description, credits } = subjectData;

  const existingSubject = await prisma.subject.findUnique({
    where: { code },
  });

  if (existingSubject) {
    const error = new Error("Subject code already exists");
    error.statusCode = 400;
    throw error;
  }

  const newSubject = await prisma.subject.create({
    data: {
      code,
      name,
      description,
      credits: credits !== undefined ? parseInt(credits, 10) : 3,
      createdById: creatorId,
    },
  });

  return newSubject;
};

const updateSubject = async (id, updateData) => {
  const subject = await prisma.subject.findUnique({
    where: { id },
  });

  if (!subject) {
    const error = new Error("Subject not found");
    error.statusCode = 404;
    throw error;
  }

  if (updateData.code && updateData.code !== subject.code) {
    const existingCode = await prisma.subject.findUnique({
      where: { code: updateData.code },
    });

    if (existingCode) {
      const error = new Error("Subject code already exists");
      error.statusCode = 400;
      throw error;
    }
  }

  const data = { ...updateData };
  if (data.credits !== undefined) {
    data.credits = parseInt(data.credits, 10);
  }

  const updatedSubject = await prisma.subject.update({
    where: { id },
    data,
  });

  return updatedSubject;
};

const deleteSubject = async (id) => {
  const subject = await prisma.subject.findUnique({
    where: { id },
  });

  if (!subject) {
    const error = new Error("Subject not found");
    error.statusCode = 404;
    throw error;
  }

  await prisma.subject.delete({
    where: { id },
  });

  return { id };
};

const assignLecturerToSubject = async (subjectId, lecturerId) => {
  const [subject, lecturer] = await Promise.all([
    prisma.subject.findUnique({ where: { id: subjectId } }),
    prisma.user.findUnique({ where: { id: lecturerId } }),
  ]);

  if (!subject) {
    const error = new Error("Subject not found");
    error.statusCode = 404;
    throw error;
  }

  if (!lecturer) {
    const error = new Error("Lecturer not found");
    error.statusCode = 404;
    throw error;
  }

  if (lecturer.role !== "LECTURER") {
    const error = new Error("User is not a lecturer");
    error.statusCode = 400;
    throw error;
  }

  const existingAssignment = await prisma.lecturerSubject.findUnique({
    where: {
      lecturerId_subjectId: {
        lecturerId,
        subjectId,
      },
    },
  });

  if (existingAssignment) {
    const error = new Error("Lecturer is already assigned to this subject");
    error.statusCode = 400;
    throw error;
  }

  const assignment = await prisma.lecturerSubject.create({
    data: {
      subjectId,
      lecturerId,
    },
    include: {
      lecturer: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  return assignment;
};

const getLecturersOfSubject = async (subjectId) => {
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject) {
    const error = new Error("Subject not found");
    error.statusCode = 404;
    throw error;
  }

  const assignments = await prisma.lecturerSubject.findMany({
    where: { subjectId },
    include: {
      lecturer: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { assignedAt: "desc" },
  });

  return assignments.map((a) => ({
    assignmentId: a.id,
    assignedAt: a.assignedAt,
    ...a.lecturer,
  }));
};

const removeLecturerFromSubject = async (subjectId, lecturerId) => {
  const assignment = await prisma.lecturerSubject.findUnique({
    where: {
      lecturerId_subjectId: {
        lecturerId,
        subjectId,
      },
    },
  });

  if (!assignment) {
    const error = new Error("Lecturer is not assigned to this subject");
    error.statusCode = 404;
    throw error;
  }

  await prisma.lecturerSubject.delete({
    where: {
      lecturerId_subjectId: {
        lecturerId,
        subjectId,
      },
    },
  });

  return { subjectId, lecturerId };
};

module.exports = {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  assignLecturerToSubject,
  getLecturersOfSubject,
  removeLecturerFromSubject,
};
