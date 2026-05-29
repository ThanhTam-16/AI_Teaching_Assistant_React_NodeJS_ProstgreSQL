const prisma = require("../config/database");

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

module.exports = {
  getSubmissionsFeedbacks,
  createSubmissionFeedback,
  updateFeedback,
  deleteFeedback,
};
