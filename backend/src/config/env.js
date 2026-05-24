require("dotenv").config();

const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL,

  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
};

if (!env.databaseUrl) {
  throw new Error("DATABASE_URL is missing in .env");
}

if (!env.jwtSecret) {
  throw new Error("JWT_SECRET is missing in .env");
}

module.exports = env;