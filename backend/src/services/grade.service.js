const prisma = require("../config/database");

const gradeSubmission = async (submissionId, gradeData, lecturerId) => {
  const { score, note } = gradeData;

  const submission = await prisma.submission.findFirst({
    where: {
      id: submissionId,
      assignment: {
        class: {
          lecturerId,
        },
      },
    },
    include: {
      assignment: {
        select: {
          totalScore: true,
        },
      },
    },
  });

  if (!submission) {
    const error = new Error("Submission not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  const parsedScore = parseFloat(score);
  if (isNaN(parsedScore) || parsedScore < 0 || parsedScore > submission.assignment.totalScore) {
    const error = new Error(`Score must be between 0 and the assignment total score (${submission.assignment.totalScore})`);
    error.statusCode = 400;
    throw error;
  }

  const result = await prisma.$transaction(async (tx) => {
    const existingGrade = await tx.grade.findUnique({
      where: { submissionId },
    });

    let grade;
    if (existingGrade) {
      grade = await tx.grade.update({
        where: { submissionId },
        data: {
          score: parsedScore,
          note,
          lecturerId,
        },
      });
    } else {
      grade = await tx.grade.create({
        data: {
          score: parsedScore,
          note,
          submissionId,
          lecturerId,
        },
      });
    }

    await tx.submission.update({
      where: { id: submissionId },
      data: { status: "GRADED" },
    });

    return grade;
  });

  return result;
};

module.exports = {
  gradeSubmission,
};
