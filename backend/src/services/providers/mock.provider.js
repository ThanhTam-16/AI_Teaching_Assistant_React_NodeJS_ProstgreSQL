const generateMockExercises = (topic, difficulty, count = 3) => {
  const diff = difficulty || "MEDIUM";
  const exercises = [];
  for (let i = 1; i <= count; i++) {
    exercises.push({
      title: `Bài tập ${i}: Thực hành về ${topic} (${diff})`,
      description: `Đề bài yêu cầu sinh viên xây dựng ứng dụng mẫu áp dụng kiến thức về ${topic}. Yêu cầu viết code sạch và tuân thủ các quy tắc thiết kế phần mềm.`,
      requirements: [
        `Yêu cầu 1: Cài đặt và cấu hình thư viện liên quan đến ${topic}.`,
        `Yêu cầu 2: Viết mã nguồn hoàn chỉnh thực thi tính năng cốt lõi.`,
        `Yêu cầu 3: Viết tài liệu hướng dẫn chạy chương trình.`
      ],
      difficulty: diff,
      suggestedAnswer: `Mã nguồn mẫu tham khảo: // TODO: Triển khai mã nguồn ${topic} thực tế...`,
      rubric: [
        { criteria: "Đúng logic nghiệp vụ và chạy không lỗi", points: 5 },
        { criteria: "Clean code và cấu trúc thư mục chuẩn", points: 3 },
        { criteria: "Tài liệu hướng dẫn (README) đầy đủ", points: 2 }
      ]
    });
  }
  return { exercises };
};

const generateMockQuiz = (topic, difficulty, count = 5, questionType = "MULTIPLE_CHOICE") => {
  const questions = [];
  for (let i = 1; i <= count; i++) {
    questions.push({
      questionText: `Câu hỏi ${i}: Đâu là phát biểu ĐÚNG khi nói về ${topic}?`,
      questionType: questionType,
      options: [
        `Đáp án A: ${topic} là một mô hình thiết kế tối ưu cho các hệ thống lớn.`,
        `Đáp án B: ${topic} chỉ có thể triển khai trong môi trường phát triển (Development).`,
        `Đáp án C: ${topic} không được khuyến nghị sử dụng vì hiệu năng kém.`,
        `Đáp án D: Tất cả các đáp án trên.`
      ],
      correctAnswer: `Đáp án A: ${topic} là một mô hình thiết kế tối ưu cho các hệ thống lớn.`,
      explanation: `Giải thích chi tiết: Đây là khái niệm cơ bản của ${topic} được giảng dạy trong chương trình.`
    });
  }
  return {
    quizTitle: `Quiz ôn tập: ${topic} - Cấp độ ${difficulty}`,
    questions
  };
};

const generateMockFeedback = (submissionContent, assignmentContext, studentLevel) => {
  return {
    summary: `Bài nộp cho ngữ cảnh "${assignmentContext || "Chưa xác định"}". Nội dung bài nộp có độ dài ${submissionContent?.length || 0} ký tự.`,
    strengths: [
      "Sinh viên hiểu rõ yêu cầu đề bài và triển khai cơ bản đầy đủ các chức năng.",
      "Cấu trúc thư mục logic, dễ đọc hiểu."
    ],
    improvementAreas: [
      "Nên bổ sung thêm phần xử lý ngoại lệ (Exception Handling) để tránh crash hệ thống.",
      "Cần viết thêm các test case kiểm tra biên."
    ],
    feedback: `Chào em, bài làm của em rất khá ở mức trình độ ${studentLevel || "AVERAGE"}. Em đã nắm chắc kiến thức cơ bản về phần này. Hãy chú ý cải thiện các điểm như tối ưu truy vấn database và xử lý lỗi biên nhé. Điểm số đề xuất là 8.5/10.`,
    recommendedReview: [
      "Tài liệu hướng dẫn Exception Handling trong NodeJS",
      "Các phương pháp kiểm thử đơn vị cơ bản"
    ]
  };
};

const generateMockLessonOutline = (topic, numberOfSections = 3) => {
  const sections = [];
  for (let i = 1; i <= numberOfSections; i++) {
    sections.push({
      heading: `Phần ${i}: Đào sâu nghiên cứu về ${topic}`,
      summary: `Mô tả nội dung chính sẽ giảng dạy trong phần ${i} bao gồm lý thuyết cơ bản và các ví dụ minh họa thực tế.`,
      keyPoints: [
        `Lý thuyết cốt lõi của phần ${i}`,
        `Ví dụ minh hoạ thực tiễn và cách triển khai`,
        `Bài tập nhỏ/Câu hỏi tương tác tại lớp`
      ]
    });
  }
  return {
    title: `Giáo án bài học: Khám phá ${topic}`,
    objectives: [
      `Hiểu được định nghĩa và tầm quan trọng của ${topic}.`,
      `Có khả năng tự triển khai các tính năng liên quan đến ${topic} độc lập.`,
      `Nhận diện được các lỗi thường gặp và cách sửa chữa.`
    ],
    sections,
    keyConcepts: [
      `${topic} cơ bản`,
      "Quy trình triển khai tiêu chuẩn",
      "Các best practices trong doanh nghiệp"
    ],
    activities: [
      "Hoạt động 1: Giảng bài và thảo luận nhóm (20 phút)",
      "Hoạt động 2: Live coding thực hành cùng giảng viên (30 phút)",
      "Hoạt động 3: Thảo luận tình huống thực tế và hỏi đáp (15 phút)"
    ],
    assessmentSuggestion: "Đánh giá thông qua bài thực hành nhóm cuối buổi học và quiz trắc nghiệm nhanh 5 câu."
  };
};

const generateMockSlideOutline = (topic, count = 10) => {
  const slides = [];
  slides.push({
    slideNumber: 1,
    title: `Giới thiệu bài học: ${topic}`,
    bulletPoints: [
      "Chào mừng các bạn đến với buổi học hôm nay",
      `Nội dung chính: Tìm hiểu toàn diện về ${topic}`,
      "Mục tiêu đạt được sau bài học"
    ],
    speakerNotes: "Bắt đầu buổi học bằng một câu chuyện hoặc câu hỏi mở liên quan đến chủ đề để thu hút sinh viên."
  });

  for (let i = 2; i < count; i++) {
    slides.push({
      slideNumber: i,
      title: `${topic} - Khái niệm quan trọng thứ ${i - 1}`,
      bulletPoints: [
        `Định nghĩa chi tiết khái niệm thứ ${i - 1}`,
        "Tác động của nó đến kiến trúc phần mềm",
        "Ví dụ minh hoạ thực tế"
      ],
      speakerNotes: `Giải thích chậm rãi khái niệm này. Dành ra 2 phút hỏi sinh viên xem có ai đã từng gặp trường hợp này chưa.`
    });
  }

  slides.push({
    slideNumber: count,
    title: "Tổng kết bài học & Bài tập về nhà",
    bulletPoints: [
      "Tóm tắt các kiến thức cốt lõi đã học",
      "Giới thiệu tài liệu đọc thêm bài học sau",
      "Nhiệm vụ về nhà của sinh viên"
    ],
    speakerNotes: "Tóm tắt nhanh, hỏi xem lớp có ai thắc mắc gì không và nhắc nhở thời hạn nộp bài tập về nhà."
  });

  return {
    title: `Slide Outline: Khóa học về ${topic}`,
    slides
  };
};

module.exports = {
  generateMockExercises,
  generateMockQuiz,
  generateMockFeedback,
  generateMockLessonOutline,
  generateMockSlideOutline
};
