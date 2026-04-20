const { getActorLabel } = require("./auth");
const { appendAuditLog } = require("./storage");
const {
  getCloseOfDayStatus,
  runCloseOfDayAutomation
} = require("./close-of-day");
const {
  getCriticalAlertsStatus,
  maybeEscalateCriticalAlerts,
  maybeSendCriticalManagementAlert
} = require("./critical-alerts");

function sendJson(res, statusCode, payload) {
  if (typeof res.status === "function" && typeof res.json === "function") {
    return res.status(statusCode).json(payload);
  }

  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

async function getCloseOfDayStatusHandler(_req, res) {
  try {
    const status = await getCloseOfDayStatus();
    return sendJson(res, 200, status);
  } catch (error) {
    console.error("Failed to load close-of-day status:", error.message);
    return sendJson(res, 500, { error: "Nu am putut incarca statusul automatizarii." });
  }
}

async function runCloseOfDayHandler(req, res) {
  try {
    const result = await runCloseOfDayAutomation({ force: true });
    await appendAuditLog({
      entityType: "automation",
      entityId: 1,
      action: "close-of-day-run",
      reason: result.sent
        ? "Rulare manuala inchidere de zi"
        : `Rulare manuala fara trimitere: ${result.reason}`,
      user: getActorLabel(req),
      newValue: result
    });
    return sendJson(res, 200, result);
  } catch (error) {
    console.error("Failed to run close-of-day automation:", error.message);
    return sendJson(res, 500, { error: "Nu am putut rula automatizarea de inchidere de zi." });
  }
}

async function getCriticalAlertsStatusHandler(_req, res) {
  try {
    const status = await getCriticalAlertsStatus();
    return sendJson(res, 200, status);
  } catch (error) {
    console.error("Failed to load critical alerts status:", error.message);
    return sendJson(res, 500, { error: "Nu am putut incarca statusul alertelor critice." });
  }
}

async function runCriticalAlertsCheckHandler(req, res) {
  try {
    const actor = getActorLabel(req);
    const checkResult = await maybeSendCriticalManagementAlert({
      trigger: "manual-check",
      actor
    });
    const escalationResult = await maybeEscalateCriticalAlerts();
    const status = await getCriticalAlertsStatus();

    await appendAuditLog({
      entityType: "automation",
      entityId: 1,
      action: "critical-alerts-check",
      reason: "Verificare manuala alerte critice",
      user: actor,
      newValue: {
        checkResult,
        escalationResult
      }
    });

    return sendJson(res, 200, {
      checkResult,
      escalationResult,
      status
    });
  } catch (error) {
    console.error("Failed to run critical alerts check:", error.message);
    return sendJson(res, 500, { error: "Nu am putut rula verificarea alertelor critice." });
  }
}

module.exports = {
  getCloseOfDayStatusHandler,
  getCriticalAlertsStatusHandler,
  runCloseOfDayHandler,
  runCriticalAlertsCheckHandler
};
