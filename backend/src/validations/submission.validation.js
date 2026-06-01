const validateSubmitSubmission = (body) => {
  const { content, fileUrl, githubUrl, codeText } = body;

  if (!content && !fileUrl && !githubUrl && !codeText) {
    const error = new Error("At least one submission field (content, fileUrl, githubUrl, or codeText) must be provided");
    error.statusCode = 400;
    throw error;
  }
};

module.exports = {
  validateSubmitSubmission,
};
