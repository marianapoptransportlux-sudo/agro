const { listAuditLogs } = require("./storage");

function sendJson(res, statusCode, payload) {
  if (typeof res.status === "function" && typeof res.json === "function") {
    return res.status(statusCode).json(payload);
  }

  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

async function listAuditLogsHandler(_req, res) {
  try {
    const auditLogs = await listAuditLogs();
    return sendJson(res, 200, { auditLogs });
  } catch (error) {
    console.error("Failed to load audit logs:", error.message);
    return sendJson(res, 500, { error: "Nu am putut incarca jurnalul de modificari." });
  }
}

module.exports = {
  listAuditLogsHandler
};
