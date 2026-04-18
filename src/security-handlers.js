const { appendAuditLog, findUserByUsername } = require("./storage");
const { getActorLabel, listUsernameLockouts, unlockUsername } = require("./auth");

function sendJson(res, statusCode, payload) {
  if (typeof res.status === "function" && typeof res.json === "function") {
    return res.status(statusCode).json(payload);
  }

  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

async function listLockoutsHandler(_req, res) {
  try {
    const lockouts = listUsernameLockouts();
    return sendJson(res, 200, { lockouts });
  } catch (error) {
    console.error("Failed to list lockouts:", error.message);
    return sendJson(res, 500, { error: "Nu am putut incarca utilizatorii blocati." });
  }
}

async function unlockUsernameHandler(req, res, username) {
  const normalizedUsername = String(username || "").trim().toLowerCase();
  if (!normalizedUsername) {
    return sendJson(res, 400, { error: "Utilizatorul pentru deblocare este obligatoriu." });
  }

  try {
    const user = await findUserByUsername(normalizedUsername);
    unlockUsername(normalizedUsername);

    await appendAuditLog({
      entityType: "auth",
      entityId: user?.id || null,
      action: "manual-unlock",
      reason: `Deblocare manuala pentru ${normalizedUsername}`,
      user: getActorLabel(req),
      newValue: { username: normalizedUsername }
    });

    return sendJson(res, 200, {
      ok: true,
      username: normalizedUsername
    });
  } catch (error) {
    console.error("Failed to unlock username:", error.message);
    return sendJson(res, 500, { error: "Nu am putut debloca utilizatorul." });
  }
}

module.exports = {
  listLockoutsHandler,
  unlockUsernameHandler
};
