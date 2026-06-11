require("dotenv").config();

const aiConfig = {
  provider: process.env.AI_PROVIDER || "mock",
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || "",
    model: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
    fallbackModels: process.env.GEMINI_FALLBACK_MODELS
      ? process.env.GEMINI_FALLBACK_MODELS.split(",").map(m => m.trim())
      : ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-3-flash"],
  },
  mockMode: process.env.AI_MOCK_MODE === "true",
  maxRetries: process.env.AI_MAX_RETRIES ? parseInt(process.env.AI_MAX_RETRIES, 10) : 1,
  retryDelayMs: process.env.AI_RETRY_DELAY_MS ? parseInt(process.env.AI_RETRY_DELAY_MS, 10) : 800,
  requestTimeoutMs: process.env.AI_REQUEST_TIMEOUT_MS ? parseInt(process.env.AI_REQUEST_TIMEOUT_MS, 10) : 30000,
};

module.exports = aiConfig;
