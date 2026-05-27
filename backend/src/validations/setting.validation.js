const validateUpdateAIFeature = (body) => {
  const { status } = body;

  if (!status || !["ACTIVE", "COMING_SOON", "DISABLED"].includes(status)) {
    const error = new Error("Status must be ACTIVE, COMING_SOON, or DISABLED");
    error.statusCode = 400;
    throw error;
  }
};

const validateUpdateSystemSetting = (body) => {
  const { value } = body;

  if (value === undefined) {
    const error = new Error("Setting value is required");
    error.statusCode = 400;
    throw error;
  }
};

module.exports = {
  validateUpdateAIFeature,
  validateUpdateSystemSetting,
};
