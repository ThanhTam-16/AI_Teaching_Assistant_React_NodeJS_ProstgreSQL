const prisma = require("../config/database");
const { formatPaginatedResponse } = require("../utils/pagination");

const getSubmissions = async ({ page, limit, skip, classId, assignmentId, status, lecturerId }) => {
  const where = {
    assignment: {
      class: {
        lecturerId,
      },
    },
  };

  if (classId) {
    where.assignment.classId = classId;
  }

  if (assignmentId) {
    where.assignmentId = assignmentId;
  }

  if (status) {
    where.status = status;
  }

  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({
      where,
      skip,
      take: limit,
      orderBy: { submittedAt: "desc" },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        assignment: {
          select: {
            id: true,
            title: true,
            totalScore: true,
            class: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
        grade: {
          select: {
            id: true,
            score: true,
            note: true,
            gradedAt: true,
          },
        },
      },
    }),
    prisma.submission.count({ where }),
  ]);

  return formatPaginatedResponse(submissions, total, page, limit, "submissions");
};

const getSubmissionById = async (id, lecturerId) => {
  const submission = await prisma.submission.findFirst({
    where: {
      id,
      assignment: {
        class: {
          lecturerId,
        },
      },
    },
    include: {
      student: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      assignment: {
        select: {
          id: true,
          title: true,
          description: true,
          totalScore: true,
          class: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      },
      grade: true,
      feedbacks: {
        orderBy: { createdAt: "desc" },
        include: {
          lecturer: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      },
    },
  });

  if (!submission) {
    const error = new Error("Submission not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  return submission;
};

const getAssignmentSubmissions = async (assignmentId, lecturerId) => {
  const assignment = await prisma.assignment.findFirst({
    where: {
      id: assignmentId,
      class: {
        lecturerId,
      },
    },
  });

  if (!assignment) {
    const error = new Error("Assignment not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  const submissions = await prisma.submission.findMany({
    where: { assignmentId },
    orderBy: { submittedAt: "desc" },
    include: {
      student: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      grade: {
        select: {
          id: true,
          score: true,
          note: true,
          gradedAt: true,
        },
      },
    },
  });

  return submissions;
};

module.exports = {
  getSubmissions,
  getSubmissionById,
  getAssignmentSubmissions,
};
