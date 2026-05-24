const app = require("./app");
const env = require("./config/env");
const prisma = require("./config/database");

const startServer = async () => {
  try {
    await prisma.$connect();

    console.log("Database connected successfully");

    app.listen(env.port, () => {
      console.log(`AITA backend server is running on port ${env.port}`);
      console.log(`API URL: http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();