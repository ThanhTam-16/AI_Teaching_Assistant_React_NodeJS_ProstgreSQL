const settingService = require("../services/setting.service");
const { successResponse } = require("../utils/response");

const getAIFeatures = async (req, res, next) => {
  try {
    const result = await settingService.getAIFeatures();
    return successResponse(res, "AI features settings fetched successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

const updateAIFeature = async (req, res, next) => {
  try {
    const idOrKey = req.params.id || req.params.key;
    const { status } = req.body;
    const result = await settingService.updateAIFeature(idOrKey, status);

    return successResponse(res, "AI feature status updated successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

const getSystemSettings = async (req, res, next) => {
  try {
    const result = await settingService.getSystemSettings();
    return successResponse(res, "System settings fetched successfully", result.settings, 200);
  } catch (error) {
    next(error);
  }
};

const updateSystemSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const result = await settingService.updateSystemSetting(key, value);

    return successResponse(res, "System setting updated successfully", result, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAIFeatures,
  updateAIFeature,
  getSystemSettings,
  updateSystemSetting,
};
