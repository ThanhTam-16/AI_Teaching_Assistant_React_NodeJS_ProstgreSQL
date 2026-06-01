const gradeService = require("../services/grade.service");
const { successResponse } = require("../utils/response");
const { getPaginationParams } = require("../utils/pagination");

const gradeSubmission = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const lecturerId = req.user.id;
    const grade = await gradeService.gradeSubmission(submissionId, req.body, lecturerId);

    return successResponse(res, "Submission graded successfully", grade, 200);
  } catch (error) {
    next(error);
  }
};

const getStudentGrades = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const studentId = req.user.id;
    const result = await gradeService.getStudentGrades({ studentId, page, limit, skip });

    return successResponse(res, "Student grades fetched successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

const getStudentGradeBySubmissionId = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const studentId = req.user.id;
    const grade = await gradeService.getStudentGradeBySubmissionId(submissionId, studentId);

    return successResponse(res, "Student grade for submission fetched successfully", grade, 200);
  } catch (error) {
    next(error);
  }
};

const getStudentGradeByAssignmentId = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user.id;
    const grade = await gradeService.getStudentGradeByAssignmentId(assignmentId, studentId);

    return successResponse(res, "Student grade for assignment fetched successfully", grade, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  gradeSubmission,
  getStudentGrades,
  getStudentGradeBySubmissionId,
  getStudentGradeByAssignmentId,
};
