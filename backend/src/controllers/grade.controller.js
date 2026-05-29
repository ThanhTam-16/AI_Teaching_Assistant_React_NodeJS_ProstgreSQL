const gradeService = require("../services/grade.service");
const { successResponse } = require("../utils/response");

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

module.exports = {
  gradeSubmission,
};
