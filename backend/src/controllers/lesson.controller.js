const lessonService = require("../services/lesson.service");
const { successResponse } = require("../utils/response");
const { getPaginationParams } = require("../utils/pagination");

const getLessons = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { search, subjectId, status } = req.query;
    const lecturerId = req.user.id;

    const result = await lessonService.getLessons({
      page,
      limit,
      skip,
      search,
      subjectId,
      status,
      lecturerId,
    });

    return successResponse(res, "Lessons fetched successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

const getLessonById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lecturerId = req.user.id;
    const lesson = await lessonService.getLessonById(id, lecturerId);

    return successResponse(res, "Lesson details fetched successfully", lesson, 200);
  } catch (error) {
    next(error);
  }
};

const createLesson = async (req, res, next) => {
  try {
    const lecturerId = req.user.id;
    const lesson = await lessonService.createLesson(req.body, lecturerId);

    return successResponse(res, "Lesson created successfully", lesson, 201);
  } catch (error) {
    next(error);
  }
};

const updateLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lecturerId = req.user.id;
    const lesson = await lessonService.updateLesson(id, req.body, lecturerId);

    return successResponse(res, "Lesson updated successfully", lesson, 200);
  } catch (error) {
    next(error);
  }
};

const deleteLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lecturerId = req.user.id;
    const result = await lessonService.deleteLesson(id, lecturerId);

    return successResponse(res, "Lesson deleted successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

const updateLessonStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const lecturerId = req.user.id;
    const lesson = await lessonService.updateLessonStatus(id, status, lecturerId);

    return successResponse(res, "Lesson status updated successfully", lesson, 200);
  } catch (error) {
    next(error);
  }
};

const addLessonMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lecturerId = req.user.id;
    const material = await lessonService.addLessonMaterial(id, req.body, lecturerId);

    return successResponse(res, "Material added successfully", material, 201);
  } catch (error) {
    next(error);
  }
};

const getLessonMaterials = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lecturerId = req.user.id;
    const materials = await lessonService.getLessonMaterials(id, lecturerId);

    return successResponse(res, "Materials fetched successfully", materials, 200);
  } catch (error) {
    next(error);
  }
};

const deleteLessonMaterial = async (req, res, next) => {
  try {
    const { id, materialId } = req.params;
    const lecturerId = req.user.id;
    const result = await lessonService.deleteLessonMaterial(id, materialId, lecturerId);

    return successResponse(res, "Material deleted successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  updateLessonStatus,
  addLessonMaterial,
  getLessonMaterials,
  deleteLessonMaterial,
};
