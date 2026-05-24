const { errorResponse } = require("../utils/response");

const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;

  return errorResponse(
    res,
    error.message || "Internal server error",
    statusCode,
    process.env.NODE_ENV === "development" ? error.stack : null
  );
};

module.exports = {
  notFound,
  errorHandler,
};