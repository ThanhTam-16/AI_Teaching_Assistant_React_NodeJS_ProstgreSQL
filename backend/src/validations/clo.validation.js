const validateCreateCLO = (body) => {
  const { code, description, subjectId } = body;

  if (!code || typeof code !== "string" || code.trim().length === 0) {
    const error = new Error("CLO code is required");
    error.statusCode = 400;
    throw error;
  }

  if (!description || typeof description !== "string" || description.trim().length === 0) {
    const error = new Error("CLO description is required");
    error.statusCode = 400;
    throw error;
  }

  if (!subjectId || typeof subjectId !== "string" || subjectId.trim().length === 0) {
    const error = new Error("Subject ID is required");
    error.statusCode = 400;
    throw error;
  }
};

const validateUpdateCLO = (body) => {
  const { code, description } = body;

  if (code !== undefined && (typeof code !== "string" || code.trim().length === 0)) {
    const error = new Error("CLO code cannot be empty");
    error.statusCode = 400;
    throw error;
  }

  if (description !== undefined && (typeof description !== "string" || description.trim().length === 0)) {
    const error = new Error("CLO description cannot be empty");
    error.statusCode = 400;
    throw error;
  }
};

module.exports = {
  validateCreateCLO,
  validateUpdateCLO,
};
