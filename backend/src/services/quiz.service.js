const prisma = require("../config/database");
const { formatPaginatedResponse } = require("../utils/pagination");

const getQuizzes = async ({ page, limit, skip, subjectId, lessonId, classId, status, lecturerId }) => {
  const where = {
    subject: {
      lecturerSubjects: {
        some: { lecturerId },
      },
    },
  };

  if (subjectId) {
    where.subjectId = subjectId;
  }

  if (lessonId) {
    where.lessonId = lessonId;
  }

  if (classId) {
    if (classId === "null") {
      where.classId = null;
    } else {
      where.classId = classId;
    }
  }

  if (status) {
    where.status = status;
  }

  const [quizzes, total] = await Promise.all([
    prisma.quiz.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        subject: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        lesson: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            questions: true,
          },
        },
      },
    }),
    prisma.quiz.count({ where }),
  ]);

  const items = quizzes.map((q) => {
    const { _count, ...rest } = q;
    return {
      ...rest,
      questionCount: _count.questions,
    };
  });

  return formatPaginatedResponse(items, total, page, limit, "quizzes");
};

const getQuizById = async (id, lecturerId) => {
  const quiz = await prisma.quiz.findFirst({
    where: {
      id,
      subject: {
        lecturerSubjects: {
          some: { lecturerId },
        },
      },
    },
    include: {
      subject: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      lesson: {
        select: {
          id: true,
          title: true,
        },
      },
      questions: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!quiz) {
    const error = new Error("Quiz not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  return quiz;
};

const createQuiz = async (quizData, lecturerId) => {
  const { title, description, difficulty, subjectId, lessonId, status, classId } = quizData;

  if (!title || !subjectId) {
    const error = new Error("Title and Subject ID are required");
    error.statusCode = 400;
    throw error;
  }

  const assigned = await prisma.lecturerSubject.findUnique({
    where: {
      lecturerId_subjectId: {
        lecturerId,
        subjectId,
      },
    },
  });

  if (!assigned) {
    const error = new Error("Subject access denied or not assigned to you");
    error.statusCode = 403;
    throw error;
  }

  const sanitizedLessonId = (lessonId && lessonId !== 'none' && lessonId !== 'null' && lessonId !== '') ? lessonId : null;

  if (sanitizedLessonId) {
    const lesson = await prisma.lesson.findFirst({
      where: { id: sanitizedLessonId, subjectId },
    });
    if (!lesson) {
      const error = new Error("Lesson not found or does not belong to the selected subject");
      error.statusCode = 400;
      throw error;
    }
  }

  const quiz = await prisma.quiz.create({
    data: {
      title,
      description,
      difficulty: difficulty || "MEDIUM",
      status: status || "DRAFT",
      subjectId,
      classId: classId === "null" ? null : (classId || null),
      lessonId: sanitizedLessonId,
      createdById: lecturerId,
    },
  });

  return quiz;
};

const updateQuiz = async (id, quizData, lecturerId) => {
  const quiz = await prisma.quiz.findFirst({
    where: {
      id,
      subject: {
        lecturerSubjects: {
          some: { lecturerId },
        },
      },
    },
  });

  if (!quiz) {
    const error = new Error("Quiz not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  const { title, description, difficulty, lessonId, status, classId } = quizData;
  const sanitizedLessonId = (lessonId && lessonId !== 'none' && lessonId !== 'null' && lessonId !== '') ? lessonId : null;

  if (sanitizedLessonId && sanitizedLessonId !== quiz.lessonId) {
    const lesson = await prisma.lesson.findFirst({
      where: { id: sanitizedLessonId, subjectId: quiz.subjectId },
    });
    if (!lesson) {
      const error = new Error("Lesson not found or does not belong to the subject of this quiz");
      error.statusCode = 400;
      throw error;
    }
  }

  const updatedQuiz = await prisma.quiz.update({
    where: { id },
    data: {
      title,
      description,
      difficulty,
      status,
      classId: classId === "null" ? null : (classId || undefined),
      lessonId: sanitizedLessonId,
    },
  });

  return updatedQuiz;
};

const deleteQuiz = async (id, lecturerId) => {
  const quiz = await prisma.quiz.findFirst({
    where: {
      id,
      subject: {
        lecturerSubjects: {
          some: { lecturerId },
        },
      },
    },
  });

  if (!quiz) {
    const error = new Error("Quiz not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  await prisma.quiz.delete({
    where: { id },
  });

  return { id };
};

const addQuizQuestion = async (quizId, questionData, lecturerId) => {
  const quiz = await prisma.quiz.findFirst({
    where: {
      id: quizId,
      subject: {
        lecturerSubjects: {
          some: { lecturerId },
        },
      },
    },
  });

  if (!quiz) {
    const error = new Error("Quiz not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  const { questionText, questionType, options, correctAnswer, explanation } = questionData;

  if (!questionText) {
    const error = new Error("Question text is required");
    error.statusCode = 400;
    throw error;
  }

  const question = await prisma.quizQuestion.create({
    data: {
      questionText,
      questionType: questionType || "MULTIPLE_CHOICE",
      options: options || null,
      correctAnswer,
      explanation,
      quizId,
    },
  });

  return question;
};

const updateQuizQuestion = async (questionId, questionData, lecturerId) => {
  const question = await prisma.quizQuestion.findFirst({
    where: {
      id: questionId,
      quiz: {
        subject: {
          lecturerSubjects: {
            some: { lecturerId },
          },
        },
      },
    },
  });

  if (!question) {
    const error = new Error("Question not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  const { questionText, questionType, options, correctAnswer, explanation } = questionData;

  const updatedQuestion = await prisma.quizQuestion.update({
    where: { id: questionId },
    data: {
      questionText,
      questionType,
      options,
      correctAnswer,
      explanation,
    },
  });

  return updatedQuestion;
};

const deleteQuizQuestion = async (questionId, lecturerId) => {
  const question = await prisma.quizQuestion.findFirst({
    where: {
      id: questionId,
      quiz: {
        subject: {
          lecturerSubjects: {
            some: { lecturerId },
          },
        },
      },
    },
  });

  if (!question) {
    const error = new Error("Question not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  await prisma.quizQuestion.delete({
    where: { id: questionId },
  });

  return { id: questionId };
};

const getStudentQuizzes = async ({ studentId, page, limit, skip, subjectId, lessonId }) => {
  const enrollments = await prisma.classEnrollment.findMany({
    where: { studentId },
    select: { classId: true },
  });
  const classIds = enrollments.map((e) => e.classId);

  const classSubjects = await prisma.classSubject.findMany({
    where: { classId: { in: classIds } },
    select: { subjectId: true },
  });
  const subjectIds = [...new Set(classSubjects.map((cs) => cs.subjectId))];

  if (subjectIds.length === 0) {
    return formatPaginatedResponse([], 0, page, limit, "quizzes");
  }

  const where = {
    subjectId: { in: subjectIds },
    status: "PUBLISHED",
    OR: [
      { classId: null },
      { classId: { in: classIds } }
    ]
  };

  if (subjectId) {
    if (!subjectIds.includes(subjectId)) {
      const error = new Error("Access denied: You are not enrolled in this subject");
      error.statusCode = 403;
      throw error;
    }
    where.subjectId = subjectId;
  }

  if (lessonId) {
    where.lessonId = lessonId;
  }

  const [quizzes, total] = await Promise.all([
    prisma.quiz.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        subject: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        lesson: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            questions: true,
          },
        },
      },
    }),
    prisma.quiz.count({ where }),
  ]);

  const items = quizzes.map((q) => {
    const { _count, ...rest } = q;
    return {
      ...rest,
      questionCount: _count.questions,
    };
  });

  return formatPaginatedResponse(items, total, page, limit, "quizzes");
};

const getStudentQuizById = async (id, studentId) => {
  const enrollments = await prisma.classEnrollment.findMany({
    where: { studentId },
    select: { classId: true },
  });
  const classIds = enrollments.map((e) => e.classId);

  const classSubjects = await prisma.classSubject.findMany({
    where: { classId: { in: classIds } },
    select: { subjectId: true },
  });
  const subjectIds = [...new Set(classSubjects.map((cs) => cs.subjectId))];

  const quiz = await prisma.quiz.findFirst({
    where: {
      id,
      subjectId: { in: subjectIds },
      status: "PUBLISHED",
      OR: [
        { classId: null },
        { classId: { in: classIds } }
      ]
    },
    include: {
      subject: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      lesson: {
        select: {
          id: true,
          title: true,
        },
      },
      questions: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!quiz) {
    const error = new Error("Quiz not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  return quiz;
};

module.exports = {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  addQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
  getStudentQuizzes,
  getStudentQuizById,
};
