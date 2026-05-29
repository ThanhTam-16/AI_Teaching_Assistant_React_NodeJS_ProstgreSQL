const cloService = require("../services/clo.service");
const { successResponse } = require("../utils/response");

const getCLOs = async (req, res, next) => {
  try {
    const { subjectId } = req.query;
    const lecturerId = req.user.id;
    const clos = await cloService.getCLOs(subjectId, lecturerId);

    return successResponse(res, "CLOs fetched successfully", clos, 200);
  } catch (error) {
    next(error);
  }
};

const getCLOById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lecturerId = req.user.id;
    const clo = await cloService.getCLOById(id, lecturerId);

    return successResponse(res, "CLO details fetched successfully", clo, 200);
  } catch (error) {
    next(error);
  }
};

const createCLO = async (req, res, next) => {
  try {
    const lecturerId = req.user.id;
    const clo = await cloService.createCLO(req.body, lecturerId);

    return successResponse(res, "CLO created successfully", clo, 201);
  } catch (error) {
    next(error);
  }
};

const updateCLO = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lecturerId = req.user.id;
    const clo = await cloService.updateCLO(id, req.body, lecturerId);

    return successResponse(res, "CLO updated successfully", clo, 200);
  } catch (error) {
    next(error);
  }
};

const deleteCLO = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lecturerId = req.user.id;
    const result = await cloService.deleteCLO(id, lecturerId);

    return successResponse(res, "CLO deleted successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCLOs,
  getCLOById,
  createCLO,
  updateCLO,
  deleteCLO,
};
