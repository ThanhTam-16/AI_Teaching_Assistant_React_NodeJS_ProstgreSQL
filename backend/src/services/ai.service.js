const prisma = require("../config/database");
const aiPromptService = require("./aiPrompt.service");
const aiProviderService = require("./aiProvider.service");

const logGeneration = async ({ type, prompt, result, status, errorMessage, userId }) => {
  try {
    return await prisma.aIGeneration.create({
      data: {
        type,
        prompt,
        result: result || null,
        status: status || "SUCCESS",
        errorMessage: errorMessage || null,
        userId,
      },
    });
  } catch (error) {
    console.error("Error saving AIGeneration log:", error);
  }
};

const handleAIGeneration = async ({ type, input, promptBuilder, providerCall, userId }) => {
  const { prompt, systemInstruction } = promptBuilder(input);
  let result = null;
  let status = "SUCCESS";
  let errorMessage = null;

  try {
    result = await providerCall(input, prompt, systemInstruction);
  } catch (error) {
    status = "FAILED";
    errorMessage = error.message || "Unknown AI error";
    console.error(`Error in generate AI type: ${type}:`, error);

    // Fallback if AI_MOCK_MODE is enabled as a safeguard
    const aiConfig = require("../config/ai.config");
    if (aiConfig.mockMode) {
      console.log(`Fallback to Mock for type: ${type} due to Gemini API failure.`);
      status = "SUCCESS"; // treat mock fallback as success for logging
      try {
        const mockProvider = require("./providers/mock.provider");
        if (type === "EXERCISE") {
          result = mockProvider.generateMockExercises(input.topic, input.difficulty, input.numberOfExercises);
        } else if (type === "QUIZ") {
          result = mockProvider.generateMockQuiz(input.topic, input.difficulty, input.numberOfQuestions, input.questionType);
        } else if (type === "FEEDBACK") {
          result = mockProvider.generateMockFeedback(input.submissionContent, input.assignmentContext, input.studentLevel);
        } else if (type === "LESSON_OUTLINE") {
          result = mockProvider.generateMockLessonOutline(input.topic, input.numberOfSections);
        } else if (type === "SLIDE_OUTLINE") {
          result = mockProvider.generateMockSlideOutline(input.topic, input.numberOfSlides);
        }
      } catch (mockError) {
        status = "FAILED";
        errorMessage = `Failed to get mock: ${mockError.message}`;
      }
    }

    if (status === "FAILED") {
      await logGeneration({ type, prompt, result: null, status, errorMessage, userId });
      throw error;
    }
  }

  const record = await logGeneration({ type, prompt, result, status, errorMessage, userId });
  if (result && typeof result === "object") {
    return {
      generationId: record?.id,
      ...result
    };
  }
  return result;
};

const generateExercises = async (input, userId) => {
  return await handleAIGeneration({
    type: "EXERCISE",
    input,
    promptBuilder: aiPromptService.buildExercisePrompt,
    providerCall: aiProviderService.generateExercises,
    userId,
  });
};

const generateQuiz = async (input, userId) => {
  return await handleAIGeneration({
    type: "QUIZ",
    input,
    promptBuilder: aiPromptService.buildQuizPrompt,
    providerCall: aiProviderService.generateQuiz,
    userId,
  });
};

const generateFeedback = async (input, userId) => {
  return await handleAIGeneration({
    type: "FEEDBACK",
    input,
    promptBuilder: aiPromptService.buildFeedbackPrompt,
    providerCall: aiProviderService.generateFeedback,
    userId,
  });
};

const generateLessonOutline = async (input, userId) => {
  return await handleAIGeneration({
    type: "LESSON_OUTLINE",
    input,
    promptBuilder: aiPromptService.buildLessonOutlinePrompt,
    providerCall: aiProviderService.generateLessonOutline,
    userId,
  });
};

const generateSlideOutline = async (input, userId) => {
  return await handleAIGeneration({
    type: "SLIDE_OUTLINE",
    input,
    promptBuilder: aiPromptService.buildSlideOutlinePrompt,
    providerCall: aiProviderService.generateSlideOutline,
    userId,
  });
};

const getAIHistory = async (userId, query = {}) => {
  const { type, status } = query;
  const where = { userId };

  if (type) {
    where.type = type;
  }
  if (status) {
    where.status = status;
  }

  const history = await prisma.aIGeneration.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return history;
};

const getAIHistoryById = async (userId, id) => {
  const log = await prisma.aIGeneration.findFirst({
    where: { id, userId },
  });

  if (!log) {
    const error = new Error("AI Generation log not found or access denied");
    error.statusCode = 404;
    throw error;
  }

  return log;
};

const saveExerciseAsAssignment = async (userId, data) => {
  const { aiGenerationId, exerciseIndex, classId, subjectId, lessonId, cloId, dueDate, totalScore } = data;

  const generation = await getAIHistoryById(userId, aiGenerationId);

  if (generation.type !== "EXERCISE") {
    const error = new Error("Invalid generation type. Log must be an EXERCISE");
    error.statusCode = 400;
    throw error;
  }

  const result = typeof generation.result === "string" ? JSON.parse(generation.result) : generation.result;
  const exercises = result?.exercises || [];
  const exercise = exercises[exerciseIndex];

  if (!exercise) {
    const error = new Error("Selected exercise index not found in generated results");
    error.statusCode = 400;
    throw error;
  }

  const requirementsString = Array.isArray(exercise.requirements)
    ? exercise.requirements.join("\n")
    : exercise.requirements || "";

  let desc = exercise.description || "";
  if (exercise.rubric && Array.isArray(exercise.rubric)) {
    desc += "\n\n**Rubric chấm điểm:**\n" + exercise.rubric.map(r => `- ${r.criteria}: ${r.points}đ`).join("\n");
  }

  const assignmentData = {
    title: exercise.title || `AI Bài tập về ${generation.prompt?.slice(0, 30) || "chủ đề"}`,
    description: desc,
    requirements: requirementsString,
    dueDate,
    totalScore: totalScore !== undefined ? parseFloat(totalScore) : 10,
    difficulty: exercise.difficulty || "MEDIUM",
    submissionType: "TEXT",
    status: "DRAFT",
    subjectId,
    classId,
    lessonId,
    cloId,
  };

  const assignmentService = require("./assignment.service");
  return await assignmentService.createAssignment(assignmentData, userId);
};

const saveQuiz = async (userId, data) => {
  const { aiGenerationId, subjectId, lessonId, title } = data;

  const generation = await getAIHistoryById(userId, aiGenerationId);

  if (generation.type !== "QUIZ") {
    const error = new Error("Invalid generation type. Log must be a QUIZ");
    error.statusCode = 400;
    throw error;
  }

  const result = typeof generation.result === "string" ? JSON.parse(generation.result) : generation.result;
  const questions = result?.questions || [];

  const quizService = require("./quiz.service");
  const quiz = await quizService.createQuiz({
    title: title || result?.quizTitle || `AI Quiz về ${generation.prompt?.slice(0, 30) || "chủ đề"}`,
    difficulty: "MEDIUM",
    subjectId,
    lessonId
  }, userId);

  for (const q of questions) {
    let qType = q.questionType || "MULTIPLE_CHOICE";
    if (!["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"].includes(qType)) {
      qType = "MULTIPLE_CHOICE";
    }

    await quizService.addQuizQuestion(quiz.id, {
      questionText: q.questionText || "Câu hỏi trống",
      questionType: qType,
      options: q.options || [],
      correctAnswer: q.correctAnswer || "",
      explanation: q.explanation || "",
    }, userId);
  }

  return await quizService.getQuizById(quiz.id, userId);
};

const saveLessonOutline = async (userId, data) => {
  const { aiGenerationId, subjectId, cloId, chapter } = data;

  const generation = await getAIHistoryById(userId, aiGenerationId);

  if (generation.type !== "LESSON_OUTLINE") {
    const error = new Error("Invalid generation type. Log must be a LESSON_OUTLINE");
    error.statusCode = 400;
    throw error;
  }

  const result = typeof generation.result === "string" ? JSON.parse(generation.result) : generation.result;

  let contentStr = "";
  if (result.sections && Array.isArray(result.sections)) {
    contentStr += "NỘI DUNG CHI TIẾT BÀI GIẢNG:\n\n";
    result.sections.forEach((sec, idx) => {
      contentStr += `${idx + 1}. ${sec.heading}\n`;
      contentStr += `   Tóm tắt: ${sec.summary || ""}\n`;
      if (sec.keyPoints && Array.isArray(sec.keyPoints)) {
        contentStr += "   Các điểm chính:\n";
        sec.keyPoints.forEach(kp => {
          contentStr += `   - ${kp}\n`;
        });
      }
      contentStr += "\n";
    });
  }

  if (result.keyConcepts && Array.isArray(result.keyConcepts)) {
    contentStr += "\nCÁC KHÁI NIỆM CỐT LÕI:\n";
    result.keyConcepts.forEach(c => {
      contentStr += `- ${c}\n`;
    });
  }

  if (result.activities && Array.isArray(result.activities)) {
    contentStr += "\nHOẠT ĐỘNG TRÊN LỚP:\n";
    result.activities.forEach(act => {
      contentStr += `- ${act}\n`;
    });
  }

  if (result.assessmentSuggestion) {
    contentStr += `\nGỢI Ý ĐÁNH GIÁ:\n${result.assessmentSuggestion}\n`;
  }

  const lessonData = {
    title: result.title || `AI Giáo án về ${generation.prompt?.slice(0, 30) || "chủ đề"}`,
    chapter: chapter || "1",
    description: result.objectives ? result.objectives.join("\n") : "Giáo án tự động tạo bởi AI.",
    content: contentStr,
    status: "DRAFT",
    subjectId,
    cloId
  };

  const lessonService = require("./lesson.service");
  return await lessonService.createLesson(lessonData, userId);
};

module.exports = {
  generateExercises,
  generateQuiz,
  generateFeedback,
  generateLessonOutline,
  generateSlideOutline,
  getAIHistory,
  getAIHistoryById,
  saveExerciseAsAssignment,
  saveQuiz,
  saveLessonOutline,
};
