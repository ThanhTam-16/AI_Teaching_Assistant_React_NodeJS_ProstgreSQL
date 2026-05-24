const prisma = require("../config/database");
const { verifyToken } = require("../utils/jwt");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const error = new Error("Access token is required");
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.split(" ")[1];

    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 401;
      throw error;
    }

    if (user.status !== "ACTIVE") {
      const error = new Error("Your account is not active");
      error.statusCode = 403;
      throw error;
    }

    req.user = user;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      error.message = "Invalid token";
      error.statusCode = 401;
    }

    if (error.name === "TokenExpiredError") {
      error.message = "Token expired";
      error.statusCode = 401;
    }

    next(error);
  }
};

module.exports = {
  authenticate,
};