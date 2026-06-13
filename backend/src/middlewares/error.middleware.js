const { errorResponse } = require("../utils/response");

const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (error, req, res, next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal server error";

  // Prisma foreign key constraint violation or DB connection/constraint issue
  if (error.code === "P2003" || (message && message.includes("Foreign key constraint violated"))) {
    statusCode = 400;
    message = "Lỗi liên kết dữ liệu: Mã bài giảng hoặc mã môn học được chọn không tồn tại hoặc không hợp lệ.";
  }

  return errorResponse(
    res,
    message,
    statusCode,
    process.env.NODE_ENV === "development" ? error.stack : null
  );
};

module.exports = {
  notFound,
  errorHandler,
};