require("dotenv").config();

async function main() {
  const { GoogleGenAI } = await import("@google/genai");

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-3.5-flash",
    contents: "Viết một câu ngắn giới thiệu hệ thống trợ giảng AI.",
  });

  console.log("Gemini response:");
  console.log(response.text);
}

main().catch((error) => {
  console.error("Gemini test error:", error);
});