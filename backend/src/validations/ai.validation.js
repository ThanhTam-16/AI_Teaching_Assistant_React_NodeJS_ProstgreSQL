const validateGenerateExercises = (body) => {
  const { topic, difficulty, numberOfExercises } = body;

  if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
    const error = new Error("Topic is required");
    error.statusCode = 400;
    throw error;
  }

  if (difficulty && !["EASY", "MEDIUM", "HARD"].includes(difficulty)) {
    const error = new Error("Difficulty must be EASY, MEDIUM, or HARD");
    error.statusCode = 400;
    throw error;
  }

  if (numberOfExercises !== undefined) {
    const count = parseInt(numberOfExercises, 10);
    if (isNaN(count) || count < 1 || count > 10) {
      const error = new Error("Number of exercises must be between 1 and 10");
      error.statusCode = 400;
      throw error;
    }
  }
};

const validateGenerateQuiz = (body) => {
  const { topic, difficulty, numberOfQuestions, questionType } = body;

  if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
    const error = new Error("Topic is required");
    error.statusCode = 400;
    throw error;
  }

  if (difficulty && !["EASY", "MEDIUM", "HARD"].includes(difficulty)) {
    const error = new Error("Difficulty must be EASY, MEDIUM, or HARD");
    error.statusCode = 400;
    throw error;
  }

  if (numberOfQuestions !== undefined) {
    const count = parseInt(numberOfQuestions, 10);
    if (isNaN(count) || count < 1 || count > 20) {
      const error = new Error("Number of questions must be between 1 and 20");
      error.statusCode = 400;
      throw error;
    }
  }

  if (questionType && !["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"].includes(questionType)) {
    const error = new Error("Invalid question type");
    error.statusCode = 400;
    throw error;
  }
};

const validateGenerateFeedback = (body) => {
  const { submissionId, submissionContent } = body;

  if (!submissionId && (!submissionContent || typeof submissionContent !== "string" || submissionContent.trim().length === 0)) {
    const error = new Error("Submission content is required when submissionId is not provided");
    error.statusCode = 400;
    throw error;
  }
};

const validateGenerateLessonOutline = (body) => {
  const { topic, numberOfSections } = body;

  if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
    const error = new Error("Topic is required");
    error.statusCode = 400;
    throw error;
  }

  if (numberOfSections !== undefined) {
    const count = parseInt(numberOfSections, 10);
    if (isNaN(count) || count < 3 || count > 10) {
      const error = new Error("Number of sections must be between 3 and 10");
      error.statusCode = 400;
      throw error;
    }
  }
};

const validateGenerateSlideOutline = (body) => {
  const { topic, numberOfSlides } = body;

  if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
    const error = new Error("Topic is required");
    error.statusCode = 400;
    throw error;
  }

  if (numberOfSlides !== undefined) {
    const count = parseInt(numberOfSlides, 10);
    if (isNaN(count) || count < 3 || count > 15) {
      const error = new Error("Number of slides must be between 3 and 15");
      error.statusCode = 400;
      throw error;
    }
  }
};

module.exports = {
  validateGenerateExercises,
  validateGenerateQuiz,
  validateGenerateFeedback,
  validateGenerateLessonOutline,
  validateGenerateSlideOutline,
};
