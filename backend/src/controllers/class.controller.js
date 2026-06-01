const classService = require("../services/class.service");
const { successResponse } = require("../utils/response");
const { getPaginationParams } = require("../utils/pagination");

const getClasses = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { search } = req.query;

    const result = await classService.getClasses({
      page,
      limit,
      skip,
      search,
    });

    return successResponse(res, "Classes fetched successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

const getClassById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const classItem = await classService.getClassById(id);

    return successResponse(res, "Class fetched successfully", classItem, 200);
  } catch (error) {
    next(error);
  }
};

const getLecturerClasses = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { search, status } = req.query;
    const lecturerId = req.user.id;

    const result = await classService.getLecturerClasses({
      page,
      limit,
      skip,
      search,
      status,
      lecturerId,
    });

    return successResponse(res, "Lecturer classes fetched successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

const getLecturerClassById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lecturerId = req.user.id;
    const classItem = await classService.getLecturerClassById(id, lecturerId);

    return successResponse(res, "Lecturer class details fetched successfully", classItem, 200);
  } catch (error) {
    next(error);
  }
};

const createClassByLecturer = async (req, res, next) => {
  try {
    const lecturerId = req.user.id;
    const classItem = await classService.createClassByLecturer(req.body, lecturerId);

    return successResponse(res, "Class created successfully", classItem, 201);
  } catch (error) {
    next(error);
  }
};

const updateClassByLecturer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lecturerId = req.user.id;
    const classItem = await classService.updateClassByLecturer(id, req.body, lecturerId);

    return successResponse(res, "Class updated successfully", classItem, 200);
  } catch (error) {
    next(error);
  }
};

const updateClassStatusByLecturer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const lecturerId = req.user.id;
    const classItem = await classService.updateClassStatusByLecturer(id, status, lecturerId);

    return successResponse(res, "Class status updated successfully", classItem, 200);
  } catch (error) {
    next(error);
  }
};

const getStudentsInClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lecturerId = req.user.id;
    const students = await classService.getStudentsInClass(id, lecturerId);

    return successResponse(res, "Class students fetched successfully", students, 200);
  } catch (error) {
    next(error);
  }
};

const addStudentToClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { studentId } = req.body;
    const lecturerId = req.user.id;
    const student = await classService.addStudentToClass(id, studentId, lecturerId);

    return successResponse(res, "Student added to class successfully", student, 201);
  } catch (error) {
    next(error);
  }
};

const removeStudentFromClass = async (req, res, next) => {
  try {
    const { id, studentId } = req.params;
    const lecturerId = req.user.id;
    const result = await classService.removeStudentFromClass(id, studentId, lecturerId);

    return successResponse(res, "Student removed from class successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

const getStudentClasses = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { search, status } = req.query;
    const studentId = req.user.id;

    const result = await classService.getStudentClasses({
      page,
      limit,
      skip,
      search,
      status,
      studentId,
    });

    return successResponse(res, "Student classes fetched successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

const getStudentClassById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;
    const classItem = await classService.getStudentClassById(id, studentId);

    return successResponse(res, "Student class details fetched successfully", classItem, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClasses,
  getClassById,
  getLecturerClasses,
  getLecturerClassById,
  createClassByLecturer,
  updateClassByLecturer,
  updateClassStatusByLecturer,
  getStudentsInClass,
  addStudentToClass,
  removeStudentFromClass,
  getStudentClasses,
  getStudentClassById,
};
