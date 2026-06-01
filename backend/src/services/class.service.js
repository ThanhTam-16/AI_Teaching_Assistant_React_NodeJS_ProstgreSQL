const prisma = require("../config/database");
const { formatPaginatedResponse } = require("../utils/pagination");

const getClasses = async ({ page, limit, skip, search }) => {
  const where = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { code: { contains: search, mode: "insensitive" } },
    ];
  }

  const [classes, total] = await Promise.all([
    prisma.class.findMany({
      where,
      skip,
      take: limit,
      orderBy: { code: "asc" },
      include: {
        lecturer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    }),
    prisma.class.count({ where }),
  ]);

  // format item to map studentCount
  const items = classes.map((c) => {
    const { _count, ...rest } = c;
    return {
      ...rest,
      studentCount: _count.enrollments,
    };
  });

  return formatPaginatedResponse(items, total, page, limit, "classes");
};

const getClassById = async (id) => {
  const classItem = await prisma.class.findUnique({
    where: { id },
    include: {
      lecturer: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      enrollments: {
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              status: true,
            },
          },
        },
      },
      classSubjects: {
        include: {
          subject: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!classItem) {
    const error = new Error("Class not found");
    error.statusCode = 404;
    throw error;
  }

  // Flatten enrolments/subjects response for cleaner presentation
  const { enrollments, classSubjects, ...rest } = classItem;
  return {
    ...rest,
    students: enrollments.map((e) => e.student),
    subjects: classSubjects.map((cs) => cs.subject),
    studentCount: enrollments.length,
  };
};

const getLecturerClasses = async ({ page, limit, skip, search, status, lecturerId }) => {
  const where = { lecturerId };

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { code: { contains: search, mode: "insensitive" } },
    ];
  }

  const [classes, total] = await Promise.all([
    prisma.class.findMany({
      where,
      skip,
      take: limit,
      orderBy: { code: "asc" },
      include: {
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    }),
    prisma.class.count({ where }),
  ]);

  const items = classes.map((c) => {
    const { _count, ...rest } = c;
    return {
      ...rest,
      studentCount: _count.enrollments,
    };
  });

  return formatPaginatedResponse(items, total, page, limit, "classes");
};

const getLecturerClassById = async (id, lecturerId) => {
  const classItem = await prisma.class.findFirst({
    where: { id, lecturerId },
    include: {
      enrollments: {
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              status: true,
            },
          },
        },
      },
      classSubjects: {
        include: {
          subject: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!classItem) {
    const error = new Error("Class not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  const { enrollments, classSubjects, ...rest } = classItem;
  return {
    ...rest,
    students: enrollments.map((e) => e.student),
    subjects: classSubjects.map((cs) => cs.subject),
    studentCount: enrollments.length,
  };
};

const createClassByLecturer = async (classData, lecturerId) => {
  const { name, code, semester, description } = classData;

  if (!name || !code) {
    const error = new Error("Class name and code are required");
    error.statusCode = 400;
    throw error;
  }

  const existingClass = await prisma.class.findUnique({
    where: { code },
  });

  if (existingClass) {
    const error = new Error("Class code already exists");
    error.statusCode = 400;
    throw error;
  }

  const newClass = await prisma.class.create({
    data: {
      name,
      code,
      semester,
      description,
      lecturerId,
    },
  });

  return newClass;
};

const updateClassByLecturer = async (id, classData, lecturerId) => {
  const classItem = await prisma.class.findFirst({
    where: { id, lecturerId },
  });

  if (!classItem) {
    const error = new Error("Class not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  const { name, code, semester, description } = classData;

  if (code && code !== classItem.code) {
    const existingClass = await prisma.class.findUnique({
      where: { code },
    });

    if (existingClass) {
      const error = new Error("Class code already exists");
      error.statusCode = 400;
      throw error;
    }
  }

  const updatedClass = await prisma.class.update({
    where: { id },
    data: {
      name,
      code,
      semester,
      description,
    },
  });

  return updatedClass;
};

const updateClassStatusByLecturer = async (id, status, lecturerId) => {
  const classItem = await prisma.class.findFirst({
    where: { id, lecturerId },
  });

  if (!classItem) {
    const error = new Error("Class not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  const validStatuses = ["ACTIVE", "INACTIVE", "ARCHIVED"];
  if (!validStatuses.includes(status)) {
    const error = new Error("Invalid class status");
    error.statusCode = 400;
    throw error;
  }

  const updatedClass = await prisma.class.update({
    where: { id },
    data: { status },
  });

  return updatedClass;
};

const getStudentsInClass = async (classId, lecturerId) => {
  const classItem = await prisma.class.findFirst({
    where: { id: classId, lecturerId },
  });

  if (!classItem) {
    const error = new Error("Class not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  const enrollments = await prisma.classEnrollment.findMany({
    where: { classId },
    include: {
      student: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          status: true,
        },
      },
    },
    orderBy: { student: { fullName: "asc" } },
  });

  return enrollments.map((e) => e.student);
};

const addStudentToClass = async (classId, studentId, lecturerId) => {
  const classItem = await prisma.class.findFirst({
    where: { id: classId, lecturerId },
  });

  if (!classItem) {
    const error = new Error("Class not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  const student = await prisma.user.findUnique({
    where: { id: studentId },
  });

  if (!student || student.role !== "STUDENT") {
    const error = new Error("Student not found or user is not a student");
    error.statusCode = 404;
    throw error;
  }

  const existingEnrollment = await prisma.classEnrollment.findUnique({
    where: {
      classId_studentId: {
        classId,
        studentId,
      },
    },
  });

  if (existingEnrollment) {
    const error = new Error("Student is already enrolled in this class");
    error.statusCode = 400;
    throw error;
  }

  const enrollment = await prisma.classEnrollment.create({
    data: {
      classId,
      studentId,
    },
    include: {
      student: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  return enrollment.student;
};

const removeStudentFromClass = async (classId, studentId, lecturerId) => {
  const classItem = await prisma.class.findFirst({
    where: { id: classId, lecturerId },
  });

  if (!classItem) {
    const error = new Error("Class not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  const enrollment = await prisma.classEnrollment.findUnique({
    where: {
      classId_studentId: {
        classId,
        studentId,
      },
    },
  });

  if (!enrollment) {
    const error = new Error("Student is not enrolled in this class");
    error.statusCode = 404;
    throw error;
  }

  await prisma.classEnrollment.delete({
    where: {
      classId_studentId: {
        classId,
        studentId,
      },
    },
  });

  return { classId, studentId };
};

const getStudentClasses = async ({ studentId, page, limit, skip, search, status }) => {
  const where = {
    enrollments: {
      some: {
        studentId,
      },
    },
  };

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { code: { contains: search, mode: "insensitive" } },
    ];
  }

  const [classes, total] = await Promise.all([
    prisma.class.findMany({
      where,
      skip,
      take: limit,
      orderBy: { code: "asc" },
      include: {
        lecturer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            classSubjects: true,
            enrollments: true,
          },
        },
      },
    }),
    prisma.class.count({ where }),
  ]);

  const items = classes.map((c) => {
    const { _count, ...rest } = c;
    return {
      ...rest,
      subjectCount: _count.classSubjects,
      studentCount: _count.enrollments,
    };
  });

  return formatPaginatedResponse(items, total, page, limit, "classes");
};

const getStudentClassById = async (id, studentId) => {
  const classItem = await prisma.class.findFirst({
    where: {
      id,
      enrollments: {
        some: {
          studentId,
        },
      },
    },
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
      classSubjects: {
        include: {
          subject: {
            select: {
              id: true,
              code: true,
              name: true,
              credits: true,
              description: true,
            },
          },
        },
      },
      enrollments: {
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  if (!classItem) {
    const error = new Error("Class not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  const { enrollments, classSubjects, ...rest } = classItem;
  return {
    ...rest,
    subjects: classSubjects.map((cs) => cs.subject),
    classmates: enrollments.map((e) => e.student),
    subjectCount: classSubjects.length,
    studentCount: enrollments.length,
  };
};

module.exports = {
  getClasses,
  getClassById,
  getLecturerClasses,
  getLecturerClassById,
  createClassByLecturer,
  updateClassByLecturer,
  updateClassStatusByLecturer,
  getStudentsInClass,
  addStudentToClass,
  removeStudentFromClass,
  getStudentClasses,
  getStudentClassById,
};
