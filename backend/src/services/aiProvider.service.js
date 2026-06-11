const aiConfig = require("../config/ai.config");
const geminiProvider = require("./providers/gemini.provider");
const mockProvider = require("./providers/mock.provider");

const generateExercises = async (input, prompt, systemInstruction) => {
  if (aiConfig.mockMode || aiConfig.provider === "mock") {
    return mockProvider.generateMockExercises(input.topic, input.difficulty, input.numberOfExercises || input.number);
  }
  return await geminiProvider.generateJSON(prompt, systemInstruction);
};

const generateQuiz = async (input, prompt, systemInstruction) => {
  if (aiConfig.mockMode || aiConfig.provider === "mock") {
    return mockProvider.generateMockQuiz(input.topic, input.difficulty, input.numberOfQuestions || input.number, input.questionType);
  }
  return await geminiProvider.generateJSON(prompt, systemInstruction);
};

const generateFeedback = async (input, prompt, systemInstruction) => {
  if (aiConfig.mockMode || aiConfig.provider === "mock") {
    return mockProvider.generateMockFeedback(input.submissionContent, input.assignmentContext, input.studentLevel);
  }
  return await geminiProvider.generateJSON(prompt, systemInstruction);
};

const generateLessonOutline = async (input, prompt, systemInstruction) => {
  if (aiConfig.mockMode || aiConfig.provider === "mock") {
    return mockProvider.generateMockLessonOutline(input.topic, input.numberOfSections || input.number);
  }
  return await geminiProvider.generateJSON(prompt, systemInstruction);
};

const generateSlideOutline = async (input, prompt, systemInstruction) => {
  if (aiConfig.mockMode || aiConfig.provider === "mock") {
    return mockProvider.generateMockSlideOutline(input.topic, input.numberOfSlides || input.slideCount);
  }
  return await geminiProvider.generateJSON(prompt, systemInstruction);
};

module.exports = {
  generateExercises,
  generateQuiz,
  generateFeedback,
  generateLessonOutline,
  generateSlideOutline,
};
