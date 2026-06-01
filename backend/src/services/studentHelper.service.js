const prisma = require("../config/database");

/**
 * Gets all class IDs the student is enrolled in
 */
const getStudentClassIds = async (studentId) => {
  const enrollments = await prisma.classEnrollment.findMany({
    where: { studentId },
    select: { classId: true },
  });
  return enrollments.map((e) => e.classId);
};

/**
 * Gets all subject IDs associated with the student's enrolled classes
 */
const getStudentSubjectIds = async (studentId) => {
  const classIds = await getStudentClassIds(studentId);
  if (classIds.length === 0) return [];
  
  const classSubjects = await prisma.classSubject.findMany({
    where: { classId: { in: classIds } },
    select: { subjectId: true },
  });
  return [...new Set(classSubjects.map((cs) => cs.subjectId))];
};

/**
 * Check if the student is enrolled in a specific class
 */
const checkStudentEnrolledInClass = async (studentId, classId) => {
  const enrollment = await prisma.classEnrollment.findUnique({
    where: {
      classId_studentId: {
        classId,
        studentId,
      },
    },
  });
  if (!enrollment) {
    const error = new Error("Access denied: You are not enrolled in this class");
    error.statusCode = 403;
    throw error;
  }
  return true;
};

/**
 * Check if the student can access a specific subject
 */
const checkStudentCanAccessSubject = async (studentId, subjectId) => {
  const classIds = await getStudentClassIds(studentId);
  if (classIds.length === 0) {
    const error = new Error("Access denied: You are not enrolled in any classes");
    error.statusCode = 403;
    throw error;
  }

  const association = await prisma.classSubject.findFirst({
    where: {
      subjectId,
      classId: { in: classIds },
    },
  });

  if (!association) {
    const error = new Error("Access denied: This subject is not available in your classes");
    error.statusCode = 403;
    throw error;
  }
  return true;
};

/**
 * Check if the student can access a specific lesson
 */
const checkStudentCanAccessLesson = async (studentId, lessonId) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, subjectId: true, status: true },
  });

  if (!lesson) {
    const error = new Error("Lesson not found");
    error.statusCode = 404;
    throw error;
  }

  if (lesson.status !== "PUBLISHED") {
    const error = new Error("Access denied: Lesson is not published");
    error.statusCode = 403;
    throw error;
  }

  await checkStudentCanAccessSubject(studentId, lesson.subjectId);
  return true;
};

/**
 * Check if the student can access a specific assignment
 */
const checkStudentCanAccessAssignment = async (studentId, assignmentId) => {
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    select: { id: true, classId: true, status: true },
  });

  if (!assignment) {
    const error = new Error("Assignment not found");
    error.statusCode = 404;
    throw error;
  }

  if (assignment.status === "DRAFT") {
    const error = new Error("Access denied: Assignment is not assigned yet");
    error.statusCode = 403;
    throw error;
  }

  await checkStudentEnrolledInClass(studentId, assignment.classId);
  return true;
};

/**
 * Check if the student owns the specified submission
 */
const checkStudentOwnsSubmission = async (studentId, submissionId) => {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: { id: true, studentId: true },
  });

  if (!submission) {
    const error = new Error("Submission not found");
    error.statusCode = 404;
    throw error;
  }

  if (submission.studentId !== studentId) {
    const error = new Error("Access denied: This submission does not belong to you");
    error.statusCode = 403;
    throw error;
  }
  return true;
};

module.exports = {
  getStudentClassIds,
  getStudentSubjectIds,
  checkStudentEnrolledInClass,
  checkStudentCanAccessSubject,
  checkStudentCanAccessLesson,
  checkStudentCanAccessAssignment,
  checkStudentOwnsSubmission,
};
