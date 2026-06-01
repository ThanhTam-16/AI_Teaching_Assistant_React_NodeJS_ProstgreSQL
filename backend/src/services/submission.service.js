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

const submitAssignment = async ({ studentId, assignmentId, content, fileUrl, githubUrl, codeText }) => {
  const enrollments = await prisma.classEnrollment.findMany({
    where: { studentId },
    select: { classId: true },
  });
  const classIds = enrollments.map((e) => e.classId);

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
  });

  if (!assignment) {
    const error = new Error("Assignment not found");
    error.statusCode = 404;
    throw error;
  }

  if (assignment.status === "DRAFT") {
    const error = new Error("Access denied: Assignment is not available yet");
    error.statusCode = 403;
    throw error;
  }

  if (assignment.status === "CLOSED") {
    const error = new Error("Cannot submit: Assignment is already closed");
    error.statusCode = 400;
    throw error;
  }

  if (!classIds.includes(assignment.classId)) {
    const error = new Error("Access denied: You are not enrolled in this class");
    error.statusCode = 403;
    throw error;
  }

  // Check if a submission already exists
  const existingSubmission = await prisma.submission.findUnique({
    where: {
      assignmentId_studentId: {
        assignmentId,
        studentId,
      },
    },
  });

  if (existingSubmission) {
    const error = new Error("You have already submitted this assignment. Use the update endpoint to modify your submission.");
    error.statusCode = 400;
    throw error;
  }

  // Determine submission status
  const now = new Date();
  let status = "SUBMITTED";
  if (assignment.dueDate && now > assignment.dueDate) {
    status = "LATE";
  }

  // Create submission
  const submission = await prisma.submission.create({
    data: {
      assignmentId,
      studentId,
      content,
      fileUrl,
      githubUrl,
      codeText,
      status,
    },
    include: {
      assignment: {
        select: {
          title: true,
          dueDate: true,
        },
      },
    },
  });

  return submission;
};

const updateSubmission = async ({ studentId, submissionId, content, fileUrl, githubUrl, codeText }) => {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      assignment: true,
      grade: true,
    },
  });

  if (!submission) {
    const error = new Error("Submission not found");
    error.statusCode = 404;
    throw error;
  }

  if (submission.studentId !== studentId) {
    const error = new Error("Access denied: This submission does not belong to you");
    error.statusCode = 403;
    throw error;
  }

  if (submission.status === "GRADED" || submission.grade) {
    const error = new Error("Cannot update: Submission is already graded");
    error.statusCode = 400;
    throw error;
  }

  if (submission.assignment.status === "CLOSED") {
    const error = new Error("Cannot update: Assignment is already closed");
    error.statusCode = 400;
    throw error;
  }

  // Determine if late now
  const now = new Date();
  let status = "SUBMITTED";
  if (submission.assignment.dueDate && now > submission.assignment.dueDate) {
    status = "LATE";
  }

  const updatedSubmission = await prisma.submission.update({
    where: { id: submissionId },
    data: {
      content,
      fileUrl,
      githubUrl,
      codeText,
      status,
    },
    include: {
      assignment: {
        select: {
          title: true,
          dueDate: true,
        },
      },
    },
  });

  return updatedSubmission;
};

const getStudentSubmissions = async ({ studentId, page, limit, skip, status, assignmentId }) => {
  const where = { studentId };

  if (status) {
    where.status = status;
  }

  if (assignmentId) {
    where.assignmentId = assignmentId;
  }

  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({
      where,
      skip,
      take: limit,
      orderBy: { submittedAt: "desc" },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            dueDate: true,
            totalScore: true,
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

const getStudentSubmissionById = async (id, studentId) => {
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      assignment: {
        select: {
          id: true,
          title: true,
          description: true,
          requirements: true,
          dueDate: true,
          totalScore: true,
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
        },
      },
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

  if (!submission) {
    const error = new Error("Submission not found");
    error.statusCode = 404;
    throw error;
  }

  if (submission.studentId !== studentId) {
    const error = new Error("Access denied: This submission does not belong to you");
    error.statusCode = 403;
    throw error;
  }

  return submission;
};

module.exports = {
  getSubmissions,
  getSubmissionById,
  getAssignmentSubmissions,
  submitAssignment,
  updateSubmission,
  getStudentSubmissions,
  getStudentSubmissionById,
};
