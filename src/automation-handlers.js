const { getActorLabel } = require("./auth");
const { appendAuditLog } = require("./storage");
const {
  getCloseOfDayStatus,
  runCloseOfDayAutomation
} = require("./close-of-day");

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

module.exports = {
  getCloseOfDayStatusHandler,
  runCloseOfDayHandler
};
