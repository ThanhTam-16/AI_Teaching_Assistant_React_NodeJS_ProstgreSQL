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

module.exports = {
  getOverviewReport,
  getClassReport,
  getAssignmentReport,
};
