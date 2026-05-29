const prisma = require("../config/database");

const checkSubjectAssignment = async (subjectId, lecturerId) => {
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
};

const getCLOs = async (subjectId, lecturerId) => {
  if (!subjectId) {
    const error = new Error("Subject ID is required");
    error.statusCode = 400;
    throw error;
  }

  await checkSubjectAssignment(subjectId, lecturerId);

  const clos = await prisma.cLO.findMany({
    where: { subjectId },
    orderBy: { code: "asc" },
  });

  return clos;
};

const getCLOById = async (id, lecturerId) => {
  const clo = await prisma.cLO.findUnique({
    where: { id },
    include: {
      subject: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!clo) {
    const error = new Error("CLO not found");
    error.statusCode = 404;
    throw error;
  }

  await checkSubjectAssignment(clo.subjectId, lecturerId);

  return clo;
};

const createCLO = async (cloData, lecturerId) => {
  const { code, description, subjectId } = cloData;

  await checkSubjectAssignment(subjectId, lecturerId);

  const existingCLO = await prisma.cLO.findUnique({
    where: {
      subjectId_code: {
        subjectId,
        code,
      },
    },
  });

  if (existingCLO) {
    const error = new Error(`CLO with code '${code}' already exists in this subject`);
    error.statusCode = 400;
    throw error;
  }

  const newCLO = await prisma.cLO.create({
    data: {
      code,
      description,
      subjectId,
    },
  });

  return newCLO;
};

const updateCLO = async (id, cloData, lecturerId) => {
  const clo = await prisma.cLO.findUnique({
    where: { id },
  });

  if (!clo) {
    const error = new Error("CLO not found");
    error.statusCode = 404;
    throw error;
  }

  await checkSubjectAssignment(clo.subjectId, lecturerId);

  const { code, description } = cloData;

  if (code && code !== clo.code) {
    const existingCLO = await prisma.cLO.findUnique({
      where: {
        subjectId_code: {
          subjectId: clo.subjectId,
          code,
        },
      },
    });

    if (existingCLO) {
      const error = new Error(`CLO with code '${code}' already exists in this subject`);
      error.statusCode = 400;
      throw error;
    }
  }

  const updatedCLO = await prisma.cLO.update({
    where: { id },
    data: {
      code,
      description,
    },
  });

  return updatedCLO;
};

const deleteCLO = async (id, lecturerId) => {
  const clo = await prisma.cLO.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          lessons: true,
          assignments: true,
        },
      },
    },
  });

  if (!clo) {
    const error = new Error("CLO not found");
    error.statusCode = 404;
    throw error;
  }

  await checkSubjectAssignment(clo.subjectId, lecturerId);

  if (clo._count.lessons > 0 || clo._count.assignments > 0) {
    const error = new Error("Cannot delete CLO because it is currently linked to lessons or assignments");
    error.statusCode = 400;
    throw error;
  }

  await prisma.cLO.delete({
    where: { id },
  });

  return { id };
};

module.exports = {
  getCLOs,
  getCLOById,
  createCLO,
  updateCLO,
  deleteCLO,
};
