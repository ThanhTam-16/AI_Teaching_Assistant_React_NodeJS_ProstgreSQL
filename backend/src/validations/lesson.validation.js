const validateCreateLesson = (body) => {
  const { title, subjectId, status } = body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    const error = new Error("Lesson title is required");
    error.statusCode = 400;
    throw error;
  }

  if (!subjectId || typeof subjectId !== "string" || subjectId.trim().length === 0) {
    const error = new Error("Subject ID is required");
    error.statusCode = 400;
    throw error;
  }

  if (status && !["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)) {
    const error = new Error("Invalid lesson status");
    error.statusCode = 400;
    throw error;
  }
};

const validateUpdateLesson = (body) => {
  const { title, status } = body;

  if (title !== undefined && (typeof title !== "string" || title.trim().length === 0)) {
    const error = new Error("Lesson title cannot be empty");
    error.statusCode = 400;
    throw error;
  }

  if (status && !["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)) {
    const error = new Error("Invalid lesson status");
    error.statusCode = 400;
    throw error;
  }
};

const validateAddMaterial = (body) => {
  const { fileName, fileUrl } = body;

  if (!fileName || typeof fileName !== "string" || fileName.trim().length === 0) {
    const error = new Error("File name is required");
    error.statusCode = 400;
    throw error;
  }

  if (!fileUrl || typeof fileUrl !== "string" || fileUrl.trim().length === 0) {
    const error = new Error("File URL is required");
    error.statusCode = 400;
    throw error;
  }
};

module.exports = {
  validateCreateLesson,
  validateUpdateLesson,
  validateAddMaterial,
};
