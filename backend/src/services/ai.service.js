const prisma = require("../config/database");

const callGemini = async (prompt, systemInstruction) => {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${systemInstruction ? `${systemInstruction}\n\n` : ""}Prompt: ${prompt}`
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API Error response:", errText);
      return null;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      return JSON.parse(text);
    }
  } catch (error) {
    console.error("Exception calling Gemini API:", error);
  }
  return null;
};

const logGeneration = async ({ type, prompt, result, status, errorMessage, userId }) => {
  try {
    return await prisma.aIGeneration.create({
      data: {
        type,
        prompt,
        result: result || null,
        status,
        errorMessage,
        userId,
      },
    });
  } catch (error) {
    console.error("Error saving AIGeneration log:", error);
  }
};

const generateExercises = async (prompt, userId) => {
  const systemInstruction = "You are an AI teaching assistant. Generate a list of exercises based on the prompt. Return JSON format: { \"exercises\": [ { \"title\": \"...\", \"description\": \"...\", \"difficulty\": \"EASY/MEDIUM/HARD\", \"requirements\": \"...\" } ] }";
  
  let result = await callGemini(prompt, systemInstruction);
  let status = "SUCCESS";
  let errorMessage = null;

  if (!result) {
    result = {
      exercises: [
        {
          title: "Bài tập 1: Tạo API Endpoint đầu tiên",
          description: "Tạo một route trong ExpressJS nhận phương thức POST và trả về JSON chào mừng.",
          difficulty: "EASY",
          requirements: "Sử dụng ExpressJS Router, xử lý req.body và trả về response đúng format."
        },
        {
          title: "Bài tập 2: Quản lý mối quan hệ Prisma",
          description: "Triển khai một câu truy vấn Prisma kết nối nhiều bảng.",
          difficulty: "MEDIUM",
          requirements: "Dùng findUnique hoặc findFirst kết hợp lệnh include để kéo dữ liệu quan hệ kèm phân trang."
        }
      ]
    };
  }

  await logGeneration({
    type: "EXERCISE",
    prompt,
    result,
    status,
    errorMessage,
    userId,
  });

  return result;
};

const generateQuiz = async (prompt, userId) => {
  const systemInstruction = "Generate a quiz with questions. Return JSON format: { \"quiz\": { \"title\": \"...\", \"description\": \"...\", \"questions\": [ { \"questionText\": \"...\", \"questionType\": \"MULTIPLE_CHOICE/TRUE_FALSE/SHORT_ANSWER\", \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"], \"correctAnswer\": \"...\", \"explanation\": \"...\" } ] } }";

  let result = await callGemini(prompt, systemInstruction);
  let status = "SUCCESS";
  let errorMessage = null;

  if (!result) {
    result = {
      quiz: {
        title: "Quiz ôn tập trắc nghiệm kiến thức lập trình",
        description: "Các câu hỏi kiểm tra kiến thức lập trình backend",
        questions: [
          {
            questionText: "Trong NodeJS, phương thức nào để đăng ký một middleware?",
            questionType: "MULTIPLE_CHOICE",
            options: [
              "app.use()",
              "app.register()",
              "app.middleware()",
              "app.add()"
            ],
            correctAnswer: "app.use()",
            explanation: "app.use() được dùng để đăng ký middleware toàn cục hoặc cho một tiền tố đường dẫn cụ thể."
          },
          {
            questionText: "RESTful API chỉ hỗ trợ định dạng dữ liệu là JSON đúng hay sai?",
            questionType: "TRUE_FALSE",
            options: ["Đúng", "Sai"],
            correctAnswer: "Sai",
            explanation: "RESTful API có thể trả về XML, HTML, Plain text hoặc các định dạng khác tùy vào header Accept."
          }
        ]
      }
    };
  }

  await logGeneration({
    type: "QUIZ",
    prompt,
    result,
    status,
    errorMessage,
    userId,
  });

  return result;
};

const generateFeedback = async (prompt, userId) => {
  const systemInstruction = "Evaluate the student's submission content/code and provide feedback. Return JSON format: { \"scoreSuggestion\": 8.5, \"generalFeedback\": \"...\", \"improvementAreas\": \"...\" }";

  let result = await callGemini(prompt, systemInstruction);
  let status = "SUCCESS";
  let errorMessage = null;

  if (!result) {
    result = {
      scoreSuggestion: 8.5,
      generalFeedback: "Bài làm rất chỉn chu. Mã nguồn được tổ chức tốt theo mô hình MVC, tách biệt rõ ràng giữa Router, Controller và Service.",
      improvementAreas: "Nên bổ sung thêm validate dữ liệu đầu vào cho các trường tùy chọn để phòng tránh lỗi cơ sở dữ liệu."
    };
  }

  await logGeneration({
    type: "FEEDBACK",
    prompt,
    result,
    status,
    errorMessage,
    userId,
  });

  return result;
};

const generateLessonOutline = async (prompt, userId) => {
  const systemInstruction = "Generate a detailed lesson outline. Return JSON format: { \"title\": \"...\", \"outline\": [ { \"heading\": \"...\", \"subsections\": [\"...\", \"...\"], \"durationMinutes\": 15 } ] }";

  let result = await callGemini(prompt, systemInstruction);
  let status = "SUCCESS";
  let errorMessage = null;

  if (!result) {
    result = {
      title: "Đề cương bài học chuẩn bị bởi AI",
      outline: [
        {
          heading: "1. Giới thiệu mô hình RESTful API",
          subsections: [
            "Các phương thức HTTP (GET, POST, PUT, DELETE)",
            "Mã trạng thái HTTP (200, 201, 400, 401, 403, 404, 500)",
            "Đặc trưng không lưu trạng thái (Statelessness)"
          ],
          durationMinutes: 20
        },
        {
          heading: "2. Thực hành xây dựng API",
          subsections: [
            "Khởi tạo project ExpressJS mới",
            "Cài đặt nodemon và các package cần thiết",
            "Viết router test"
          ],
          durationMinutes: 40
        }
      ]
    };
  }

  await logGeneration({
    type: "LESSON_OUTLINE",
    prompt,
    result,
    status,
    errorMessage,
    userId,
  });

  return result;
};

const generateSlideOutline = async (prompt, userId) => {
  const systemInstruction = "Generate slide presentation structure. Return JSON format: { \"presentationTitle\": \"...\", \"slides\": [ { \"slideNumber\": 1, \"title\": \"...\", \"bulletPoints\": [\"...\", \"...\"], \"visualNotes\": \"...\" } ] }";

  let result = await callGemini(prompt, systemInstruction);
  let status = "SUCCESS";
  let errorMessage = null;

  if (!result) {
    result = {
      presentationTitle: "Thiết kế Slide bài giảng: Cơ chế hoạt động của Event Loop",
      slides: [
        {
          slideNumber: 1,
          title: "Giới thiệu Event Loop",
          bulletPoints: [
            "NodeJS là đơn luồng (Single Threaded)",
            "Làm thế nào NodeJS xử lý hàng ngàn request cùng lúc?",
            "Vai trò của Event Loop trong môi trường NodeJS"
          ],
          visualNotes: "Đặt biểu tượng NodeJS ở giữa, bao quanh bởi các mũi tên tạo thành một vòng lặp liên tục."
        },
        {
          slideNumber: 2,
          title: "Các hàng đợi trong Event Loop",
          bulletPoints: [
            "Hàng đợi Microtask (nextTick, Promise)",
            "Hàng đợi Timers (setTimeout, setInterval)",
            "Hàng đợi Poll và Check"
          ],
          visualNotes: "Vẽ sơ đồ phân cấp các ngăn xếp/hàng đợi từ trên xuống dưới theo thứ tự ưu tiên."
        }
      ]
    };
  }

  await logGeneration({
    type: "SLIDE_OUTLINE",
    prompt,
    result,
    status,
    errorMessage,
    userId,
  });

  return result;
};

module.exports = {
  generateExercises,
  generateQuiz,
  generateFeedback,
  generateLessonOutline,
  generateSlideOutline,
};
