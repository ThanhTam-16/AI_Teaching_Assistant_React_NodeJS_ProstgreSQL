const prisma = require("../config/database");

const getOverviewReport = async (lecturerId) => {
  const classes = await prisma.class.findMany({
    where: { lecturerId },
    select: { id: true, name: true, code: true },
  });

  const classIds = classes.map((c) => c.id);

  if (classIds.length === 0) {
    return {
      totalClasses: 0,
      totalStudents: 0,
      totalAssignments: 0,
      totalSubmissions: 0,
      averageScore: 0,
      classes: [],
    };
  }

  const [totalStudents, totalAssignments, totalSubmissions, gradedSubmissions] = await Promise.all([
    prisma.classEnrollment.count({
      where: { classId: { in: classIds } },
    }),
    prisma.assignment.count({
      where: { classId: { in: classIds } },
    }),
    prisma.submission.count({
      where: { assignment: { classId: { in: classIds } } },
    }),
    prisma.grade.findMany({
      where: { submission: { assignment: { classId: { in: classIds } } } },
      select: { score: true },
    }),
  ]);

  const averageScore = gradedSubmissions.length > 0
    ? gradedSubmissions.reduce((sum, g) => sum + g.score, 0) / gradedSubmissions.length
    : 0;

  return {
    totalClasses: classes.length,
    totalStudents,
    totalAssignments,
    totalSubmissions,
    averageScore: Math.round(averageScore * 100) / 100,
    classes: classes.map((c) => ({
      id: c.id,
      name: c.name,
      code: c.code,
    })),
  };
};

const getClassReport = async (classId, lecturerId) => {
  const classItem = await prisma.class.findFirst({
    where: { id: classId, lecturerId },
    include: {
      enrollments: {
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      },
      assignments: {
        select: {
          id: true,
          title: true,
          totalScore: true,
        },
      },
    },
  });

  if (!classItem) {
    const error = new Error("Class not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  const students = classItem.enrollments.map((e) => e.student);
  const assignments = classItem.assignments;
  const assignmentIds = assignments.map((a) => a.id);

  if (students.length === 0) {
    return {
      className: classItem.name,
      classCode: classItem.code,
      totalStudents: 0,
      totalAssignments: assignments.length,
      totalSubmissions: 0,
      totalGraded: 0,
      totalPendingGrading: 0,
      averageScore: 0,
      studentsSupportNeeded: [],
      studentStats: [],
    };
  }

  const [submissions, grades] = await Promise.all([
    prisma.submission.findMany({
      where: { assignmentId: { in: assignmentIds } },
      select: { id: true, studentId: true, status: true, assignmentId: true },
    }),
    prisma.grade.findMany({
      where: { submission: { assignmentId: { in: assignmentIds } } },
      select: { score: true, submission: { select: { studentId: true } } },
    }),
  ]);

  const totalStudents = students.length;
  const totalAssignments = assignments.length;
  const totalSubmissions = submissions.length;
  const totalGraded = submissions.filter((s) => s.status === "GRADED").length;
  const totalPendingGrading = totalSubmissions - totalGraded;

  const averageScore = grades.length > 0
    ? grades.reduce((sum, g) => sum + g.score, 0) / grades.length
    : 0;

  const studentStats = students.map((student) => {
    const studentSubmissions = submissions.filter((s) => s.studentId === student.id);
    const studentGrades = grades.filter((g) => g.submission.studentId === student.id);
    const missingCount = Math.max(0, totalAssignments - studentSubmissions.length);

    const studentAvgScore = studentGrades.length > 0
      ? studentGrades.reduce((sum, g) => sum + g.score, 0) / studentGrades.length
      : null;

    return {
      ...student,
      submissionsCount: studentSubmissions.length,
      missingCount,
      averageScore: studentAvgScore !== null ? Math.round(studentAvgScore * 100) / 100 : null,
    };
  });

  const studentsSupportNeeded = studentStats.filter((s) => {
    if (totalAssignments === 0) return false;
    const lowScore = s.averageScore !== null && s.averageScore < 5.0;
    const highMissing = s.missingCount / totalAssignments >= 0.3;
    return lowScore || highMissing;
  });

  return {
    className: classItem.name,
    classCode: classItem.code,
    totalStudents,
    totalAssignments,
    totalSubmissions,
    totalGraded,
    totalPendingGrading,
    averageScore: Math.round(averageScore * 100) / 100,
    studentsSupportNeeded,
    studentStats,
  };
};

const getAssignmentReport = async (assignmentId, lecturerId) => {
  const assignment = await prisma.assignment.findFirst({
    where: {
      id: assignmentId,
      class: {
        lecturerId,
      },
    },
    include: {
      class: {
        include: {
          enrollments: {
            include: {
              student: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                },
              },
            },
          },
        },
      },
      submissions: {
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
              score: true,
            },
          },
        },
      },
    },
  });

  if (!assignment) {
    const error = new Error("Assignment not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  const allStudents = assignment.class.enrollments.map((e) => e.student);
  const submissions = assignment.submissions;

  const submittedStudentIds = submissions.map((s) => s.studentId);
  const missingStudents = allStudents.filter((s) => !submittedStudentIds.includes(s.id));

  const gradedSubmissions = submissions.filter((s) => s.grade !== null);
  const scores = gradedSubmissions.map((s) => s.grade.score);

  const averageScore = scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / scores.length : 0;
  const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
  const minScore = scores.length > 0 ? Math.min(...scores) : 0;

  return {
    assignmentTitle: assignment.title,
    dueDate: assignment.dueDate,
    totalStudents: allStudents.length,
    totalSubmissions: submissions.length,
    totalGraded: gradedSubmissions.length,
    totalMissing: missingStudents.length,
    averageScore: Math.round(averageScore * 100) / 100,
    maxScore,
    minScore,
    missingStudents,
    submissions: submissions.map((s) => ({
      id: s.id,
      studentName: s.student.fullName,
      studentEmail: s.student.email,
      status: s.status,
      submittedAt: s.submittedAt,
      score: s.grade ? s.grade.score : null,
    })),
  };
};

const calculateProgress = async (studentId, filter = {}) => {
  const enrollments = await prisma.classEnrollment.findMany({
    where: { studentId },
    select: { classId: true },
  });
  const classIds = enrollments.map((e) => e.classId);

  if (classIds.length === 0) {
    return {
      totalAssignments: 0,
      completedAssignments: 0,
      missingAssignments: 0,
      lateSubmissions: 0,
      gradedAssignments: 0,
      averageScore: 0,
      completionRate: 0,
      weakSubjects: [],
      recommendedReviewLessons: [],
    };
  }

  const where = {
    classId: { in: classIds },
    status: { in: ["ASSIGNED", "CLOSED"] },
  };

  if (filter.classId) {
    if (!classIds.includes(filter.classId)) {
      const error = new Error("Access denied: You are not enrolled in this class");
      error.statusCode = 403;
      throw error;
    }
    where.classId = filter.classId;
  }

  if (filter.subjectId) {
    const assigned = await prisma.classSubject.findFirst({
      where: {
        subjectId: filter.subjectId,
        classId: { in: classIds },
      },
    });
    if (!assigned) {
      const error = new Error("Access denied: Subject is not available in your classes");
      error.statusCode = 403;
      throw error;
    }
    where.subjectId = filter.subjectId;
  }

  const assignments = await prisma.assignment.findMany({
    where,
    select: { id: true, subjectId: true, lessonId: true },
  });

  const totalAssignments = assignments.length;
  const assignmentIds = assignments.map((a) => a.id);

  if (totalAssignments === 0) {
    return {
      totalAssignments: 0,
      completedAssignments: 0,
      missingAssignments: 0,
      lateSubmissions: 0,
      gradedAssignments: 0,
      averageScore: 0,
      completionRate: 0,
      weakSubjects: [],
      recommendedReviewLessons: [],
    };
  }

  const submissions = await prisma.submission.findMany({
    where: {
      studentId,
      assignmentId: { in: assignmentIds },
    },
    include: {
      grade: true,
      assignment: {
        select: {
          subjectId: true,
          lessonId: true,
        },
      },
    },
  });

  const completedAssignments = submissions.length;
  const missingAssignments = Math.max(0, totalAssignments - completedAssignments);
  const lateSubmissions = submissions.filter((s) => s.status === "LATE").length;
  const gradedAssignments = submissions.filter((s) => s.grade !== null).length;

  const totalScoreObtained = submissions.reduce((sum, s) => sum + (s.grade ? s.grade.score : 0), 0);
  const averageScore = gradedAssignments > 0 ? parseFloat((totalScoreObtained / gradedAssignments).toFixed(2)) : 0;
  const completionRate = totalAssignments > 0 ? parseFloat(((completedAssignments / totalAssignments) * 100).toFixed(2)) : 0;

  const subjectScores = {};
  for (const s of submissions) {
    if (s.grade !== null) {
      const subId = s.assignment.subjectId;
      if (!subjectScores[subId]) {
        subjectScores[subId] = [];
      }
      subjectScores[subId].push(s.grade.score);
    }
  }

  const weakSubjects = [];
  const subjectDetails = await prisma.subject.findMany({
    where: { id: { in: Object.keys(subjectScores) } },
  });

  for (const sub of subjectDetails) {
    const scores = subjectScores[sub.id];
    const avg = scores.reduce((sum, sc) => sum + sc, 0) / scores.length;
    if (avg < 5.0) {
      weakSubjects.push({
        id: sub.id,
        code: sub.code,
        name: sub.name,
        averageScore: parseFloat(avg.toFixed(2)),
      });
    }
  }

  const lowScoreLessons = submissions
    .filter((s) => s.grade !== null && s.grade.score < 5.0 && s.assignment.lessonId)
    .map((s) => s.assignment.lessonId);

  const recommendedReviewLessons = lowScoreLessons.length > 0
    ? await prisma.lesson.findMany({
        where: { id: { in: lowScoreLessons } },
        select: { id: true, title: true, chapter: true, subjectId: true },
      })
    : [];

  return {
    totalAssignments,
    completedAssignments,
    missingAssignments,
    lateSubmissions,
    gradedAssignments,
    averageScore,
    completionRate,
    weakSubjects,
    recommendedReviewLessons,
  };
};

const getStudentProgress = async (studentId) => {
  return calculateProgress(studentId);
};

const getStudentSubjectProgress = async (studentId, subjectId) => {
  return calculateProgress(studentId, { subjectId });
};

const getStudentClassProgress = async (studentId, classId) => {
  return calculateProgress(studentId, { classId });
};

module.exports = {
  getOverviewReport,
  getClassReport,
  getAssignmentReport,
  getStudentProgress,
  getStudentSubjectProgress,
  getStudentClassProgress,
};
