const {
  createConfigEntry,
  getConfig,
  updateConfigEntry,
  updateSystemSettings
} = require("./storage");
const { getActorLabel } = require("./auth");
const { triggerCriticalManagementAlert } = require("./critical-alerts");

function sendJson(res, statusCode, payload) {
  if (typeof res.status === "function" && typeof res.json === "function") {
    return res.status(statusCode).json(payload);
  }

  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

function getBody(req) {
  return req.body || {};
}

async function getConfigHandler(_req, res) {
  try {
    const config = await getConfig();
    return sendJson(res, 200, config);
  } catch (error) {
    console.error("Failed to load config:", error.message);
    return sendJson(res, 500, { error: "Nu am putut incarca configurarile." });
  }
}

async function createConfigEntryHandler(req, res, entity) {
  try {
    const entry = await createConfigEntry(entity, getBody(req));
    return sendJson(res, 201, entry);
  } catch (error) {
    console.error(`Failed to create config entry for ${entity}:`, error.message);
    return sendJson(res, 400, { error: "Nu am putut salva elementul de configurare." });
  }
}

async function updateConfigEntryHandler(req, res, entity, id) {
  try {
    const entry = await updateConfigEntry(entity, id, {
      ...getBody(req),
      changedBy: getActorLabel(req)
    });

    if (!entry) {
      return sendJson(res, 404, { error: "Elementul nu a fost gasit." });
    }

    return sendJson(res, 200, entry);
  } catch (error) {
    console.error(`Failed to update config entry for ${entity}:`, error.message);
    return sendJson(res, 400, { error: "Nu am putut actualiza elementul." });
  }
}

async function updateSystemSettingsHandler(req, res) {
  try {
    const actor = getActorLabel(req);
    const settings = await updateSystemSettings({
      ...getBody(req),
      changedBy: actor
    });
    const response = sendJson(res, 200, settings);
    triggerCriticalManagementAlert({
      trigger: "system-settings-updated",
      actor
    });
    return response;
  } catch (error) {
    console.error("Failed to update system settings:", error.message);
    return sendJson(res, 400, { error: "Nu am putut salva setarile sistemului." });
  }
}

module.exports = {
  createConfigEntryHandler,
  getConfigHandler,
  updateConfigEntryHandler,
  updateSystemSettingsHandler
};
