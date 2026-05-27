const validateCreateSubject = (body) => {
  const { code, name, description, credits } = body;

  if (!code || typeof code !== "string" || code.trim().length === 0) {
    const error = new Error("Subject code is required");
    error.statusCode = 400;
    throw error;
  }

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    const error = new Error("Subject name is required");
    error.statusCode = 400;
    throw error;
  }

  if (credits !== undefined) {
    const parsedCredits = parseInt(credits, 10);
    if (isNaN(parsedCredits) || parsedCredits < 0) {
      const error = new Error("Credits must be a positive integer");
      error.statusCode = 400;
      throw error;
    }
  }
};

const validateUpdateSubject = (body) => {
  const { code, name, description, credits } = body;

  if (code !== undefined && (typeof code !== "string" || code.trim().length === 0)) {
    const error = new Error("Subject code cannot be empty");
    error.statusCode = 400;
    throw error;
  }

  if (name !== undefined && (typeof name !== "string" || name.trim().length === 0)) {
    const error = new Error("Subject name cannot be empty");
    error.statusCode = 400;
    throw error;
  }

  if (credits !== undefined) {
    const parsedCredits = parseInt(credits, 10);
    if (isNaN(parsedCredits) || parsedCredits < 0) {
      const error = new Error("Credits must be a positive integer");
      error.statusCode = 400;
      throw error;
    }
  }
};

const validateAssignLecturer = (body) => {
  const { lecturerId } = body;

  if (!lecturerId || typeof lecturerId !== "string") {
    const error = new Error("Lecturer ID is required");
    error.statusCode = 400;
    throw error;
  }
};

module.exports = {
  validateCreateSubject,
  validateUpdateSubject,
  validateAssignLecturer,
};
