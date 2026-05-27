const prisma = require("../config/database");

const getAIFeatures = async () => {
  const features = await prisma.aIFeature.findMany({
    orderBy: { name: "asc" },
  });
  return features.map((f) => ({
    ...f,
    isActive: f.status === "ACTIVE",
  }));
};

const updateAIFeature = async (idOrKey, status) => {
  const actualStatus = status === true || status === "ACTIVE" ? "ACTIVE" : "DISABLED";

  let feature = await prisma.aIFeature.findFirst({
    where: {
      OR: [
        { id: idOrKey },
        { key: idOrKey }
      ]
    }
  });

  if (!feature) {
    const error = new Error(`AI Feature with id/key '${idOrKey}' not found`);
    error.statusCode = 404;
    throw error;
  }

  const updatedFeature = await prisma.aIFeature.update({
    where: { id: feature.id },
    data: { status: actualStatus },
  });

  return {
    ...updatedFeature,
    isActive: updatedFeature.status === "ACTIVE",
  };
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
