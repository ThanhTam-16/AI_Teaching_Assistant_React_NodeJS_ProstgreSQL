const prisma = require("../config/database");

const getStats = async () => {
  const [
    totalUsers,
    totalLecturers,
    totalStudents,
    totalClasses,
    totalSubjects,
    totalAssignments,
    recentSubmissions,
    recentAIGenerations,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "LECTURER" } }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.class.count(),
    prisma.subject.count(),
    prisma.assignment.count(),
    prisma.submission.findMany({
      take: 5,
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
                name: true,
              },
            },
          },
        },
      },
    }),
    prisma.aIGeneration.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
      },
    }),
  ]);

  return {
    overview: {
      totalUsers,
      totalLecturers,
      totalStudents,
      totalClasses,
      totalSubjects,
      totalAssignments,
    },
    recentSubmissions: recentSubmissions.map((s) => ({
      id: s.id,
      studentName: s.student.fullName,
      studentEmail: s.student.email,
      assignmentTitle: s.assignment.title,
      className: s.assignment.class.name,
      status: s.status,
      submittedAt: s.submittedAt,
    })),
    recentAIGenerations: recentAIGenerations.map((g) => ({
      id: g.id,
      type: g.type,
      prompt: g.prompt,
      status: g.status,
      errorMessage: g.errorMessage,
      generatedBy: g.user ? g.user.fullName : "System",
      role: g.user ? g.user.role : null,
      createdAt: g.createdAt,
    })),
  };
};

module.exports = {
  getStats,
};
