const assignmentService = require("../services/assignment.service");
const { successResponse } = require("../utils/response");
const { getPaginationParams } = require("../utils/pagination");

const getAssignments = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { search, classId, subjectId, status } = req.query;
    const lecturerId = req.user.id;

    const result = await assignmentService.getAssignments({
      page,
      limit,
      skip,
      search,
      classId,
      subjectId,
      status,
      lecturerId,
    });

    return successResponse(res, "Assignments fetched successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

const getAssignmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lecturerId = req.user.id;
    const assignment = await assignmentService.getAssignmentById(id, lecturerId);

    return successResponse(res, "Assignment details fetched successfully", assignment, 200);
  } catch (error) {
    next(error);
  }
};

const createAssignment = async (req, res, next) => {
  try {
    const lecturerId = req.user.id;
    const assignment = await assignmentService.createAssignment(req.body, lecturerId);

    return successResponse(res, "Assignment created successfully", assignment, 201);
  } catch (error) {
    next(error);
  }
};

const updateAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lecturerId = req.user.id;
    const assignment = await assignmentService.updateAssignment(id, req.body, lecturerId);

    return successResponse(res, "Assignment updated successfully", assignment, 200);
  } catch (error) {
    next(error);
  }
};

const deleteAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lecturerId = req.user.id;
    const result = await assignmentService.deleteAssignment(id, lecturerId);

    return successResponse(res, "Assignment deleted successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

const updateAssignmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const lecturerId = req.user.id;
    const assignment = await assignmentService.updateAssignmentStatus(id, status, lecturerId);

    return successResponse(res, "Assignment status updated successfully", assignment, 200);
  } catch (error) {
    next(error);
  }
};

const getStudentAssignments = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { search, classId, subjectId, status } = req.query;
    const studentId = req.user.id;

    const result = await assignmentService.getStudentAssignments({
      page,
      limit,
      skip,
      search,
      classId,
      subjectId,
      status,
      studentId,
    });

    return successResponse(res, "Student assignments fetched successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

const getStudentAssignmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;
    const assignment = await assignmentService.getStudentAssignmentById(id, studentId);

    return successResponse(res, "Student assignment details fetched successfully", assignment, 200);
  } catch (error) {
    next(error);
  }
};

const getStudentAssignmentMySubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;
    const submission = await assignmentService.getStudentAssignmentMySubmission(id, studentId);

    return successResponse(res, "Student assignment submission details fetched successfully", submission, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  updateAssignmentStatus,
  getStudentAssignments,
  getStudentAssignmentById,
  getStudentAssignmentMySubmission,
};
