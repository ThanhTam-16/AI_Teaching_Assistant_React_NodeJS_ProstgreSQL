const aiConfig = require("../../config/ai.config");

let GoogleGenAI;

const initGemini = async () => {
  if (!GoogleGenAI) {
    const genai = await import("@google/genai");
    GoogleGenAI = genai.GoogleGenAI;
  }
};

const cleanJsonString = (str) => {
  let cleaned = str.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/^```\s*/, "");
    cleaned = cleaned.replace(/\s*```$/, "");
  }
  return cleaned.trim();
};

const generateJSON = async (prompt, systemInstruction) => {
  const apiKey = aiConfig.gemini.apiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing in environment variables.");
  }

  await initGemini();
  const ai = new GoogleGenAI({ apiKey });

  const primaryModel = aiConfig.gemini.model || "gemini-3.1-flash-lite";
  const fallbackModels = aiConfig.gemini.fallbackModels || ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-3-flash"];
  const modelsToTry = [...new Set([primaryModel, ...fallbackModels])];

  let lastError = null;
  const maxRetries = aiConfig.maxRetries !== undefined ? aiConfig.maxRetries : 1;
  const retryDelay = aiConfig.retryDelayMs !== undefined ? aiConfig.retryDelayMs : 800;
  const timeoutMs = aiConfig.requestTimeoutMs !== undefined ? aiConfig.requestTimeoutMs : 30000;

  for (let i = 0; i < modelsToTry.length; i++) {
    const model = modelsToTry[i];
    const maxAttempts = maxRetries + 1;
    let attempts = 0;
    let currentDelay = retryDelay;

    console.log(`[Gemini Provider] Trying model: ${model}`);

    while (attempts < maxAttempts) {
      try {
        attempts++;
        if (attempts > 1) {
          console.log(`[Gemini Provider] Retrying model: ${model} (attempt ${attempts}/${maxAttempts})`);
        }

        const responsePromise = ai.models.generateContent({
          model: model,
          contents: prompt,
          config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
          },
        });

        const response = await Promise.race([
          responsePromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error("AI_REQUEST_TIMEOUT")), timeoutMs))
        ]);

        const rawText = response.text;
        if (!rawText) {
          throw new Error("Empty response from Gemini API.");
        }

        try {
          const cleaned = cleanJsonString(rawText);
          const parsed = JSON.parse(cleaned);
          console.log(`[Gemini Provider] Successful generation using model: ${model}`);
          return parsed;
        } catch (error) {
          console.error(`[Gemini Provider] Failed to parse response as JSON for model ${model}:`, error.message);
          throw new Error(`JSON_PARSE_ERROR: ${error.message}`);
        }
      } catch (error) {
        lastError = error;
        const statusCode = error.status || (error.error && error.error.code);
        const errorMsg = error.message || "";

        console.warn(`[Gemini Provider] Model failed: ${model} - status ${statusCode || 'unknown'}. Error: ${errorMsg}`);

        const isTransient = statusCode === 503 || 
                            statusCode === 429 || 
                            errorMsg.includes("503") || 
                            errorMsg.includes("429") || 
                            errorMsg.includes("UNAVAILABLE") || 
                            errorMsg.includes("RESOURCE_EXHAUSTED") ||
                            errorMsg.includes("high demand") ||
                            errorMsg.includes("AI_REQUEST_TIMEOUT");

        if (isTransient && attempts < maxAttempts) {
          console.warn(`[Gemini Provider] Transient error. Waiting ${currentDelay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, currentDelay));
          currentDelay *= 2;
        } else {
          if (i < modelsToTry.length - 1) {
            console.log(`[Gemini Provider] Fallback to model: ${modelsToTry[i + 1]}`);
          }
          break;
        }
      }
    }
  }

  const friendlyError = new Error("AI service is temporarily unavailable. Please try again later or switch model.");
  friendlyError.status = 503;
  friendlyError.originalError = lastError;
  throw friendlyError;
};

module.exports = {
  generateJSON,
};
