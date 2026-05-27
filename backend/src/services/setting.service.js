const prisma = require("../config/database");

const getAIFeatures = async () => {
  return await prisma.aIFeature.findMany({
    orderBy: { name: "asc" },
  });
};

const updateAIFeature = async (key, status) => {
  const feature = await prisma.aIFeature.findUnique({
    where: { key },
  });

  if (!feature) {
    const error = new Error(`AI Feature with key '${key}' not found`);
    error.statusCode = 404;
    throw error;
  }

  const updatedFeature = await prisma.aIFeature.update({
    where: { key },
    data: { status },
  });

  return updatedFeature;
};

const getSystemSettings = async () => {
  const settings = await prisma.systemSetting.findMany({
    orderBy: { key: "asc" },
  });

  // format settings to be a key-value dictionary as well as array
  const dict = {};
  settings.forEach((s) => {
    dict[s.key] = s.value;
  });

  return {
    settings,
    dict,
  };
};

const updateSystemSetting = async (key, value) => {
  const updatedSetting = await prisma.systemSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });

  return updatedSetting;
};

module.exports = {
  getAIFeatures,
  updateAIFeature,
  getSystemSettings,
  updateSystemSetting,
};
