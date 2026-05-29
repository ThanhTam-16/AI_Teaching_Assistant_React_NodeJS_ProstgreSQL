const validateCreateAssignment = (body) => {
  const { title, subjectId, classId, totalScore, difficulty, submissionType, status } = body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    const error = new Error("Assignment title is required");
    error.statusCode = 400;
    throw error;
  }

  if (!subjectId || typeof subjectId !== "string" || subjectId.trim().length === 0) {
    const error = new Error("Subject ID is required");
    error.statusCode = 400;
    throw error;
  }

  if (!classId || typeof classId !== "string" || classId.trim().length === 0) {
    const error = new Error("Class ID is required");
    error.statusCode = 400;
    throw error;
  }

  if (totalScore !== undefined) {
    const score = parseFloat(totalScore);
    if (isNaN(score) || score <= 0) {
      const error = new Error("Total score must be a positive number");
      error.statusCode = 400;
      throw error;
    }
  }

  if (difficulty && !["EASY", "MEDIUM", "HARD"].includes(difficulty)) {
    const error = new Error("Invalid difficulty value");
    error.statusCode = 400;
    throw error;
  }

  if (submissionType && !["TEXT", "FILE", "CODE", "LINK"].includes(submissionType)) {
    const error = new Error("Invalid submission type");
    error.statusCode = 400;
    throw error;
  }

  if (status && !["DRAFT", "ASSIGNED", "CLOSED"].includes(status)) {
    const error = new Error("Invalid assignment status");
    error.statusCode = 400;
    throw error;
  }
};

const validateUpdateAssignment = (body) => {
  const { title, totalScore, difficulty, submissionType, status } = body;

  if (title !== undefined && (typeof title !== "string" || title.trim().length === 0)) {
    const error = new Error("Assignment title cannot be empty");
    error.statusCode = 400;
    throw error;
  }

  if (totalScore !== undefined) {
    const score = parseFloat(totalScore);
    if (isNaN(score) || score <= 0) {
      const error = new Error("Total score must be a positive number");
      error.statusCode = 400;
      throw error;
    }
  }

  if (difficulty && !["EASY", "MEDIUM", "HARD"].includes(difficulty)) {
    const error = new Error("Invalid difficulty value");
    error.statusCode = 400;
    throw error;
  }

  if (submissionType && !["TEXT", "FILE", "CODE", "LINK"].includes(submissionType)) {
    const error = new Error("Invalid submission type");
    error.statusCode = 400;
    throw error;
  }

  if (status && !["DRAFT", "ASSIGNED", "CLOSED"].includes(status)) {
    const error = new Error("Invalid assignment status");
    error.statusCode = 400;
    throw error;
  }
};

module.exports = {
  validateCreateAssignment,
  validateUpdateAssignment,
};
