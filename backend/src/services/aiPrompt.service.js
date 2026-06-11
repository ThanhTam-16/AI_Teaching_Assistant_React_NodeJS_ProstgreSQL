const buildExercisePrompt = (input) => {
  const { topic, difficulty, numberOfExercises, clo, exerciseType } = input;
  const prompt = `Generate exactly ${numberOfExercises || 3} exercises for the topic: "${topic}".
Difficulty level: ${difficulty || "MEDIUM"}.
${clo ? `Linked course learning outcome (CLO): "${clo}".` : ""}
${exerciseType ? `Exercise type: "${exerciseType}".` : ""}
Make sure the requirements are specific, clear, and relevant to the topic. Do not include any text outside of the requested JSON.`;

  const systemInstruction = `You are a helpful education assistant for lecturers. Generate a list of exercises based on the user request.
The output MUST be a valid JSON object matching the following structure:
{
  "exercises": [
    {
      "title": "Exercise title",
      "description": "Short description of the exercise task",
      "requirements": ["Requirement 1", "Requirement 2"],
      "difficulty": "EASY/MEDIUM/HARD",
      "suggestedAnswer": "A guideline or sample solution code/explanation",
      "rubric": [
        {
          "criteria": "Assessment criteria details",
          "points": 5
        }
      ]
    }
  ]
}
Return only the raw JSON. Do not include markdown code block syntax (like \`\`\`json).`;

  return { prompt, systemInstruction };
};

const buildQuizPrompt = (input) => {
  const { topic, difficulty, numberOfQuestions, questionType } = input;
  const prompt = `Generate exactly ${numberOfQuestions || 5} questions about topic: "${topic}".
Difficulty level: ${difficulty || "MEDIUM"}.
Question type: ${questionType || "MULTIPLE_CHOICE"}.
Include options (if multiple choice), correct answer, and detailed explanation for each. Do not include any text outside of the requested JSON.`;

  const systemInstruction = `You are an AI teaching assistant. Generate a quiz based on the user request.
The output MUST be a valid JSON object matching the following structure:
{
  "quizTitle": "A descriptive title of the quiz",
  "questions": [
    {
      "questionText": "The actual question query",
      "questionType": "MULTIPLE_CHOICE/TRUE_FALSE/SHORT_ANSWER",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "correctAnswer": "The exact string representing the correct option or value",
      "explanation": "Detailed explanation of why this answer is correct"
    }
  ]
}
Return only the raw JSON. Do not include markdown code block syntax (like \`\`\`json).`;

  return { prompt, systemInstruction };
};

const buildFeedbackPrompt = (input) => {
  const { submissionContent, assignmentContext, studentLevel, score } = input;
  const prompt = `Analyze the student submission below for the assignment "${assignmentContext || "Unspecified Assignment"}".
Student Level: ${studentLevel || "AVERAGE"}.
${score !== undefined ? `Assigned Score: ${score}.` : ""}
Submission Content:
"""
${submissionContent}
"""
Provide structured, constructive, and detailed pedagogical feedback. Do not include any text outside of the requested JSON.`;

  const systemInstruction = `You are an expert academic tutor. Evaluate the student's submission text or code and provide detailed, constructive, and polite feedback.
The output MUST be a valid JSON object matching the following structure:
{
  "summary": "Short overall summary of the student's work",
  "strengths": ["Strength point 1", "Strength point 2"],
  "improvementAreas": ["Point to improve 1", "Point to improve 2"],
  "feedback": "A complete, personal, and polite feedback letter addressed to the student (in Vietnamese, starting with 'Chào em, ...')",
  "recommendedReview": ["Topic to study or review 1", "Topic to study or review 2"]
}
Return only the raw JSON. Do not include markdown code block syntax (like \`\`\`json).`;

  return { prompt, systemInstruction };
};

const buildLessonOutlinePrompt = (input) => {
  const { topic, clo, level, numberOfSections } = input;
  const prompt = `Generate a detailed lesson outline for the topic: "${topic}".
${clo ? `Linked course learning outcome (CLO): "${clo}".` : ""}
${level ? `Target audience student level: "${level}".` : ""}
Sections count: ${numberOfSections || 3}.
Do not include any text outside of the requested JSON.`;

  const systemInstruction = `You are an academic curriculum designer. Build a complete lesson outline based on the user request.
The output MUST be a valid JSON object matching the following structure:
{
  "title": "A compelling title of the lesson",
  "objectives": ["Objective 1", "Objective 2"],
  "sections": [
    {
      "heading": "Section heading",
      "summary": "Detailed summary of what is taught in this section",
      "keyPoints": ["Core concept 1", "Core concept 2"]
    }
  ],
  "keyConcepts": ["Concept A", "Concept B"],
  "activities": ["Activity 1 (e.g. Group discussion for 15m)", "Activity 2 (e.g. Practice lab for 30m)"],
  "assessmentSuggestion": "Detailed suggestion on how to assess students' understanding of this lesson"
}
Return only the raw JSON. Do not include markdown code block syntax (like \`\`\`json).`;

  return { prompt, systemInstruction };
};

const buildSlideOutlinePrompt = (input) => {
  const { topic, clo, level, numberOfSlides } = input;
  const prompt = `Create a structured slide-by-slide outline for a presentation about "${topic}".
${clo ? `Linked course learning outcome (CLO): "${clo}".` : ""}
${level ? `Target student level: "${level}".` : ""}
Total slides: ${numberOfSlides || 10}.
Do not include any text outside of the requested JSON.`;

  const systemInstruction = `You are an instructional designer. Structure a presentation slide outline based on the user request.
The output MUST be a valid JSON object matching the following structure:
{
  "title": "Title of the presentation",
  "slides": [
    {
      "slideNumber": 1,
      "title": "Title of this slide",
      "bulletPoints": ["Bullet point 1 details", "Bullet point 2 details"],
      "speakerNotes": "Details notes or explanations for the presenter to say"
    }
  ]
}
Return only the raw JSON. Do not include markdown code block syntax (like \`\`\`json).`;

  return { prompt, systemInstruction };
};

module.exports = {
  buildExercisePrompt,
  buildQuizPrompt,
  buildFeedbackPrompt,
  buildLessonOutlinePrompt,
  buildSlideOutlinePrompt,
};
