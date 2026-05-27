const subjectService = require("../services/subject.service");
const { successResponse } = require("../utils/response");
const { getPaginationParams } = require("../utils/pagination");

const getSubjects = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { search } = req.query;

    const result = await subjectService.getSubjects({
      page,
      limit,
      skip,
      search,
    });

    return successResponse(res, "Subjects fetched successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

const getSubjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const subject = await subjectService.getSubjectById(id);

    return successResponse(res, "Subject fetched successfully", subject, 200);
  } catch (error) {
    next(error);
  }
};

const createSubject = async (req, res, next) => {
  try {
    const newSubject = await subjectService.createSubject(req.body, req.user.id);

    return successResponse(res, "Subject created successfully", newSubject, 201);
  } catch (error) {
    next(error);
  }
};

const updateSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedSubject = await subjectService.updateSubject(id, req.body);

    return successResponse(res, "Subject updated successfully", updatedSubject, 200);
  } catch (error) {
    next(error);
  }
};

const deleteSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await subjectService.deleteSubject(id);

    return successResponse(res, "Subject deleted successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

const assignLecturer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { lecturerId } = req.body;
    const result = await subjectService.assignLecturerToSubject(id, lecturerId);

    return successResponse(res, "Lecturer assigned to subject successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

const getLecturers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await subjectService.getLecturersOfSubject(id);

    return successResponse(res, "Lecturers of subject fetched successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

const removeLecturer = async (req, res, next) => {
  try {
    const { id, lecturerId } = req.params;
    const result = await subjectService.removeLecturerFromSubject(id, lecturerId);

    return successResponse(res, "Lecturer removed from subject successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  assignLecturer,
  getLecturers,
  removeLecturer,
};
