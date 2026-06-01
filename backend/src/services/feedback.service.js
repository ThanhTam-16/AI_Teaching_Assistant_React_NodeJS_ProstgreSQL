const prisma = require("../config/database");
const { formatPaginatedResponse } = require("../utils/pagination");

const getSubmissionsFeedbacks = async (submissionId, lecturerId) => {
  const submission = await prisma.submission.findFirst({
    where: {
      id: submissionId,
      assignment: {
        class: {
          lecturerId,
        },
      },
    },
  });

  if (!submission) {
    const error = new Error("Submission not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  const feedbacks = await prisma.feedback.findMany({
    where: { submissionId },
    orderBy: { createdAt: "desc" },
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

  return feedbacks;
};

const createSubmissionFeedback = async (submissionId, feedbackData, lecturerId) => {
  const { content, improvementAreas, source } = feedbackData;

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    const error = new Error("Feedback content is required");
    error.statusCode = 400;
    throw error;
  }

  const submission = await prisma.submission.findFirst({
    where: {
      id: submissionId,
      assignment: {
        class: {
          lecturerId,
        },
      },
    },
  });

  if (!submission) {
    const error = new Error("Submission not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  const newFeedback = await prisma.feedback.create({
    data: {
      content,
      improvementAreas,
      source: source || "MANUAL",
      submissionId,
      lecturerId,
    },
  });

  return newFeedback;
};

const updateFeedback = async (id, feedbackData, lecturerId) => {
  const feedback = await prisma.feedback.findFirst({
    where: {
      id,
      lecturerId,
    },
  });

  if (!feedback) {
    const error = new Error("Feedback not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  const { content, improvementAreas } = feedbackData;

  if (content !== undefined && (typeof content !== "string" || content.trim().length === 0)) {
    const error = new Error("Feedback content cannot be empty");
    error.statusCode = 400;
    throw error;
  }

  const updatedFeedback = await prisma.feedback.update({
    where: { id },
    data: {
      content,
      improvementAreas,
    },
  });

  return updatedFeedback;
};

const deleteFeedback = async (id, lecturerId) => {
  const feedback = await prisma.feedback.findFirst({
    where: {
      id,
      lecturerId,
    },
  });

  if (!feedback) {
    const error = new Error("Feedback not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  await prisma.feedback.delete({
    where: { id },
  });

  return { id };
};

const getStudentFeedbacks = async ({ studentId, page, limit, skip }) => {
  const [feedbacks, total] = await Promise.all([
    prisma.feedback.findMany({
      where: {
        submission: {
          studentId,
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        submission: {
          include: {
            assignment: {
              select: {
                id: true,
                title: true,
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
        },
        lecturer: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    }),
    prisma.feedback.count({
      where: {
        submission: {
          studentId,
        },
      },
    }),
  ]);

  const items = feedbacks.map((f) => ({
    id: f.id,
    content: f.content,
    improvementAreas: f.improvementAreas,
    source: f.source,
    createdAt: f.createdAt,
    submissionId: f.submissionId,
    assignmentId: f.submission.assignment.id,
    assignmentTitle: f.submission.assignment.title,
    subjectCode: f.submission.assignment.subject.code,
    subjectName: f.submission.assignment.subject.name,
    lecturerName: f.lecturer ? f.lecturer.fullName : "System",
  }));

  return formatPaginatedResponse(items, total, page, limit, "feedbacks");
};

const getStudentFeedbackBySubmissionId = async (submissionId, studentId) => {
  const submission = await prisma.submission.findFirst({
    where: { id: submissionId, studentId },
  });

  if (!submission) {
    const error = new Error("Submission not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  const feedbacks = await prisma.feedback.findMany({
    where: { submissionId },
    orderBy: { createdAt: "desc" },
    include: {
      lecturer: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });

  return feedbacks;
};

const getStudentFeedbackByAssignmentId = async (assignmentId, studentId) => {
  const submission = await prisma.submission.findFirst({
    where: { assignmentId, studentId },
  });

  if (!submission) {
    return [];
  }

  const feedbacks = await prisma.feedback.findMany({
    where: { submissionId: submission.id },
    orderBy: { createdAt: "desc" },
    include: {
      lecturer: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });

  return feedbacks;
};

module.exports = {
  getSubmissionsFeedbacks,
  createSubmissionFeedback,
  updateFeedback,
  deleteFeedback,
  getStudentFeedbacks,
  getStudentFeedbackBySubmissionId,
  getStudentFeedbackByAssignmentId,
};
