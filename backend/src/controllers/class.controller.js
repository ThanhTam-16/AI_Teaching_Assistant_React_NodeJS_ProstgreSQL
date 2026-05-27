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

module.exports = {
  getClasses,
  getClassById,
};
