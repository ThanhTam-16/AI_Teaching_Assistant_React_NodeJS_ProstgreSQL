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

module.exports = {
  getClasses,
  getClassById,
};
