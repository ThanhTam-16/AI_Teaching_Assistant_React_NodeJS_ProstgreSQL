require("dotenv/config");

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcryptjs");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("Start seeding database...");

  await prisma.feedback.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.lessonMaterial.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.cLO.deleteMany();
  await prisma.classSubject.deleteMany();
  await prisma.lecturerSubject.deleteMany();
  await prisma.classEnrollment.deleteMany();
  await prisma.class.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.aIGeneration.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.aIFeature.deleteMany();
  await prisma.systemSetting.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("123456", 10);

  const admin = await prisma.user.create({
    data: {
      fullName: "System Admin",
      email: "admin@aita.com",
      password,
      role: "ADMIN",
      phone: "0900000001",
    },
  });

  const lecturer = await prisma.user.create({
    data: {
      fullName: "Nguyen Van Lecturer",
      email: "lecturer@aita.com",
      password,
      role: "LECTURER",
      phone: "0900000002",
    },
  });

  const lecturer2 = await prisma.user.create({
    data: {
      fullName: "Tran Thi Lecturer",
      email: "lecturer2@aita.com",
      password,
      role: "LECTURER",
      phone: "0900000003",
    },
  });

  const student1 = await prisma.user.create({
    data: {
      fullName: "Le Minh Student",
      email: "student@aita.com",
      password,
      role: "STUDENT",
      phone: "0900000004",
    },
  });

  const student2 = await prisma.user.create({
    data: {
      fullName: "Pham An Student",
      email: "student2@aita.com",
      password,
      role: "STUDENT",
      phone: "0900000005",
    },
  });

  const subjectReact = await prisma.subject.create({
    data: {
      code: "FER201",
      name: "Front-End Development with React",
      description: "Course about ReactJS fundamentals and frontend development.",
      credits: 3,
      createdById: admin.id,
    },
  });

  const subjectNode = await prisma.subject.create({
    data: {
      code: "SDN301",
      name: "Node.js Backend Development",
      description: "Course about backend development using Node.js and Express.",
      credits: 3,
      createdById: admin.id,
    },
  });

  const classSE1701 = await prisma.class.create({
    data: {
      name: "SE1701",
      code: "SE1701",
      semester: "Summer 2026",
      description: "Software Engineering class SE1701.",
      lecturerId: lecturer.id,
    },
  });

  const classSE1702 = await prisma.class.create({
    data: {
      name: "SE1702",
      code: "SE1702",
      semester: "Summer 2026",
      description: "Software Engineering class SE1702.",
      lecturerId: lecturer2.id,
    },
  });

  await prisma.classEnrollment.createMany({
    data: [
      {
        classId: classSE1701.id,
        studentId: student1.id,
      },
      {
        classId: classSE1701.id,
        studentId: student2.id,
      },
    ],
  });

  await prisma.lecturerSubject.createMany({
    data: [
      {
        lecturerId: lecturer.id,
        subjectId: subjectReact.id,
      },
      {
        lecturerId: lecturer.id,
        subjectId: subjectNode.id,
      },
      {
        lecturerId: lecturer2.id,
        subjectId: subjectReact.id,
      },
    ],
  });

  await prisma.classSubject.createMany({
    data: [
      {
        classId: classSE1701.id,
        subjectId: subjectReact.id,
      },
      {
        classId: classSE1701.id,
        subjectId: subjectNode.id,
      },
      {
        classId: classSE1702.id,
        subjectId: subjectReact.id,
      },
    ],
  });

  const clo1 = await prisma.cLO.create({
    data: {
      code: "CLO1",
      description: "Understand basic React concepts, components, props and state.",
      subjectId: subjectReact.id,
    },
  });

  const clo2 = await prisma.cLO.create({
    data: {
      code: "CLO2",
      description: "Build interactive user interfaces using React hooks.",
      subjectId: subjectReact.id,
    },
  });

  const clo3 = await prisma.cLO.create({
    data: {
      code: "CLO3",
      description: "Connect frontend with backend APIs.",
      subjectId: subjectReact.id,
    },
  });

  const lesson1 = await prisma.lesson.create({
    data: {
      title: "Introduction to React Components",
      chapter: "Chapter 1",
      description: "This lesson introduces React components and JSX.",
      content:
        "React components are reusable UI blocks. JSX allows developers to write HTML-like syntax inside JavaScript.",
      status: "PUBLISHED",
      subjectId: subjectReact.id,
      cloId: clo1.id,
      createdById: lecturer.id,
    },
  });

  const lesson2 = await prisma.lesson.create({
    data: {
      title: "React State and Events",
      chapter: "Chapter 2",
      description: "This lesson explains state and event handling in React.",
      content:
        "State allows React components to store dynamic data. Events allow users to interact with the interface.",
      status: "PUBLISHED",
      subjectId: subjectReact.id,
      cloId: clo2.id,
      createdById: lecturer.id,
    },
  });

  await prisma.lessonMaterial.create({
    data: {
      fileName: "react-introduction.pdf",
      fileUrl: "/uploads/lessons/react-introduction.pdf",
      fileType: "pdf",
      lessonId: lesson1.id,
    },
  });

  const assignment1 = await prisma.assignment.create({
    data: {
      title: "Build a Simple React Profile Card",
      description: "Students create a React component to display a profile card.",
      requirements:
        "Create a reusable ProfileCard component using props. The card should display name, avatar, role and short bio.",
      dueDate: new Date("2026-06-15T23:59:00.000Z"),
      totalScore: 10,
      difficulty: "EASY",
      submissionType: "LINK",
      status: "ASSIGNED",
      subjectId: subjectReact.id,
      classId: classSE1701.id,
      lessonId: lesson1.id,
      cloId: clo1.id,
      createdById: lecturer.id,
    },
  });

  const assignment2 = await prisma.assignment.create({
    data: {
      title: "React Counter App",
      description: "Students build a counter app using React state.",
      requirements:
        "Create a counter with increase, decrease and reset buttons using useState.",
      dueDate: new Date("2026-06-20T23:59:00.000Z"),
      totalScore: 10,
      difficulty: "MEDIUM",
      submissionType: "CODE",
      status: "ASSIGNED",
      subjectId: subjectReact.id,
      classId: classSE1701.id,
      lessonId: lesson2.id,
      cloId: clo2.id,
      createdById: lecturer.id,
    },
  });

  const submission1 = await prisma.submission.create({
    data: {
      assignmentId: assignment1.id,
      studentId: student1.id,
      githubUrl: "https://github.com/student/react-profile-card",
      content: "I completed the profile card component and pushed it to GitHub.",
      status: "GRADED",
    },
  });

  const submission2 = await prisma.submission.create({
    data: {
      assignmentId: assignment1.id,
      studentId: student2.id,
      githubUrl: "https://github.com/student2/profile-card",
      content: "This is my submission for the React profile card assignment.",
      status: "SUBMITTED",
    },
  });

  await prisma.grade.create({
    data: {
      submissionId: submission1.id,
      lecturerId: lecturer.id,
      score: 8.5,
      note: "Good component structure and clear UI.",
    },
  });

  await prisma.feedback.create({
    data: {
      submissionId: submission1.id,
      lecturerId: lecturer.id,
      source: "MANUAL",
      content:
        "Your component is well structured. You should improve naming consistency and add better spacing.",
      improvementAreas: "Component naming, UI spacing, reusable props.",
    },
  });

  await prisma.feedback.create({
    data: {
      submissionId: submission2.id,
      lecturerId: lecturer.id,
      source: "AI",
      content:
        "The submission shows basic understanding of React props. Suggested improvement: separate data and UI rendering more clearly.",
      improvementAreas: "Props usage, file organization, UI consistency.",
    },
  });

  const quiz = await prisma.quiz.create({
    data: {
      title: "React Basics Quiz",
      description: "Quiz generated for React component lesson.",
      difficulty: "EASY",
      subjectId: subjectReact.id,
      lessonId: lesson1.id,
      createdById: lecturer.id,
    },
  });

  await prisma.quizQuestion.createMany({
    data: [
      {
        quizId: quiz.id,
        questionText: "What is a React component?",
        questionType: "MULTIPLE_CHOICE",
        options: [
          "A reusable UI block",
          "A database table",
          "A server function",
          "A CSS file",
        ],
        correctAnswer: "A reusable UI block",
        explanation: "React components are reusable parts of the user interface.",
      },
      {
        quizId: quiz.id,
        questionText: "JSX allows HTML-like syntax inside JavaScript.",
        questionType: "TRUE_FALSE",
        options: ["True", "False"],
        correctAnswer: "True",
        explanation: "JSX is commonly used to describe UI in React.",
      },
    ],
  });

  await prisma.aIGeneration.create({
    data: {
      type: "EXERCISE",
      prompt:
        "Generate 2 easy React exercises for students learning components and props.",
      result: {
        exercises: [
          {
            title: "Create a Profile Card",
            difficulty: "Easy",
          },
          {
            title: "Create a Product Card",
            difficulty: "Easy",
          },
        ],
      },
      status: "SUCCESS",
      userId: lecturer.id,
    },
  });

  await prisma.aIGeneration.create({
    data: {
      type: "FEEDBACK",
      prompt:
        "Generate feedback for a React profile card submission with basic props usage.",
      result: {
        feedback:
          "The submission demonstrates basic understanding. Improve naming, layout spacing and component reuse.",
      },
      status: "SUCCESS",
      userId: lecturer.id,
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: student1.id,
        type: "ASSIGNMENT",
        title: "New assignment assigned",
        message: "Build a Simple React Profile Card has been assigned.",
        relatedUrl: "/student/assignments",
      },
      {
        userId: student1.id,
        type: "GRADE",
        title: "Assignment graded",
        message: "Your React Profile Card assignment has been graded.",
        relatedUrl: "/student/feedback",
      },
      {
        userId: lecturer.id,
        type: "SUBMISSION",
        title: "New submission received",
        message: "A student submitted the React Profile Card assignment.",
        relatedUrl: "/lecturer/submissions",
      },
    ],
  });

  await prisma.aIFeature.createMany({
    data: [
      {
        key: "ai_exercise_generator",
        name: "AI Exercise Generator",
        description: "Generate exercises based on topic, CLO and difficulty.",
        status: "ACTIVE",
      },
      {
        key: "ai_quiz_generator",
        name: "AI Quiz Generator",
        description: "Generate quizzes from lessons or topics.",
        status: "ACTIVE",
      },
      {
        key: "ai_feedback_generator",
        name: "AI Feedback Generator",
        description: "Suggest feedback for student submissions.",
        status: "ACTIVE",
      },
      {
        key: "ai_slide_generator",
        name: "AI Slide Generator",
        description: "Generate slide outlines or full lecture slides.",
        status: "COMING_SOON",
      },
      {
        key: "ai_code_review",
        name: "AI Code Review",
        description: "Analyze code quality and suggest improvements.",
        status: "COMING_SOON",
      },
      {
        key: "ai_learning_path",
        name: "AI Learning Path Recommendation",
        description: "Recommend personalized learning paths for students.",
        status: "COMING_SOON",
      },
    ],
  });

  await prisma.systemSetting.createMany({
    data: [
      {
        key: "system_name",
        value: "AITA - AI Teaching Assistant",
      },
      {
        key: "allow_register",
        value: false,
      },
      {
        key: "default_user_password",
        value: "123456",
      },
      {
        key: "ai_provider",
        value: "OpenAI/Gemini/Claude API",
      },
    ],
  });

  console.log("Database seeded successfully.");
  console.log("Demo accounts:");
  console.log("Admin: admin@aita.com / 123456");
  console.log("Lecturer: lecturer@aita.com / 123456");
  console.log("Student: student@aita.com / 123456");
}

main()
  .catch((error) => {
    console.error("Seed error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });