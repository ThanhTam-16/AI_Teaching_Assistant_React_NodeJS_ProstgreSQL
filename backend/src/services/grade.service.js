const prisma = require("../config/database");
const { formatPaginatedResponse } = require("../utils/pagination");

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

const getStudentGrades = async ({ studentId, page, limit, skip }) => {
  const [grades, total] = await Promise.all([
    prisma.grade.findMany({
      where: {
        submission: {
          studentId,
        },
      },
      skip,
      take: limit,
      orderBy: { gradedAt: "desc" },
      include: {
        submission: {
          include: {
            assignment: {
              select: {
                id: true,
                title: true,
                totalScore: true,
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
    prisma.grade.count({
      where: {
        submission: {
          studentId,
        },
      },
    }),
  ]);

  const items = grades.map((g) => ({
    id: g.id,
    score: g.score,
    note: g.note,
    gradedAt: g.gradedAt,
    submissionId: g.submissionId,
    assignmentId: g.submission.assignment.id,
    assignmentTitle: g.submission.assignment.title,
    totalScore: g.submission.assignment.totalScore,
    subjectCode: g.submission.assignment.subject.code,
    subjectName: g.submission.assignment.subject.name,
    lecturerName: g.lecturer ? g.lecturer.fullName : "System",
  }));

  return formatPaginatedResponse(items, total, page, limit, "grades");
};

const getStudentGradeBySubmissionId = async (submissionId, studentId) => {
  const grade = await prisma.grade.findFirst({
    where: {
      submissionId,
      submission: {
        studentId,
      },
    },
    include: {
      submission: {
        include: {
          assignment: {
            select: {
              id: true,
              title: true,
              totalScore: true,
            },
          },
        },
      },
      lecturer: {
        select: {
          fullName: true,
        },
      },
    },
  });

  if (!grade) {
    const error = new Error("Grade not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  return grade;
};

const getStudentGradeByAssignmentId = async (assignmentId, studentId) => {
  const grade = await prisma.grade.findFirst({
    where: {
      submission: {
        assignmentId,
        studentId,
      },
    },
    include: {
      submission: {
        include: {
          assignment: {
            select: {
              id: true,
              title: true,
              totalScore: true,
            },
          },
        },
      },
      lecturer: {
        select: {
          fullName: true,
        },
      },
    },
  });

  if (!grade) {
    const error = new Error("Grade not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  return grade;
};

module.exports = {
  gradeSubmission,
  getStudentGrades,
  getStudentGradeBySubmissionId,
  getStudentGradeByAssignmentId,
};
