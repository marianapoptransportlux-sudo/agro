const { appendAuditLog, findUserByUsername, updateUserPasswordById } = require("./storage");
const {
  clearFailedLogins,
  clearFailedLoginsForUsername,
  clearSessionCookie,
  createSession,
  destroySession,
  getClientIp,
  isLoginBlocked,
  isUsernameBlocked,
  registerFailedLogin,
  registerFailedLoginForUsername,
  sanitizeUserForSession,
  setSessionCookie,
  updateSessionUser,
  validatePasswordPolicy,
  verifyPassword
} = require("./auth");

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

async function loginHandler(req, res) {
  const ip = getClientIp(req);
  const body = getBody(req);
  const username = String(body.username || "").trim();
  const password = String(body.password || "");

  if (!username || !password) {
    return sendJson(res, 400, { error: "Utilizatorul si parola sunt obligatorii." });
  }

  const usernameRateLimitState = isUsernameBlocked(username);
  if (usernameRateLimitState.blocked) {
    return sendJson(res, 429, {
      error: `Contul este blocat temporar. Reincearca peste ${Math.ceil(
        usernameRateLimitState.retryAfterMs / 60000
      )} minute sau solicita administratorului de sistem deblocarea manuala.`
    });
  }

  try {
    const user = await findUserByUsername(username);

    if (!user || user.active === false) {
      const rateLimitState = isLoginBlocked(ip);
      if (rateLimitState.blocked) {
        return sendJson(res, 429, {
          error: `Prea multe incercari esuate. Reincearca peste ${Math.ceil(
            rateLimitState.retryAfterMs / 60000
          )} minute.`
        });
      }

      registerFailedLogin(ip);
      await appendAuditLog({
        entityType: "auth",
        entityId: null,
        action: "login-failed",
        reason: `Autentificare esuata pentru ${username}`,
        user: username || "necunoscut",
        newValue: { username, ip }
      });
      return sendJson(res, 401, { error: "Date de autentificare invalide." });
    }

    const passwordIsValid = verifyPassword(password, user.passwordSalt, user.passwordHash);
    if (!passwordIsValid) {
      registerFailedLogin(ip);
      registerFailedLoginForUsername(user.username || username);
      await appendAuditLog({
        entityType: "auth",
        entityId: user.id,
        action: "login-failed",
        reason: "Parola invalida",
        user: user.username || username,
        newValue: { username: user.username, ip }
      });
      return sendJson(res, 401, { error: "Date de autentificare invalide." });
    }

    clearFailedLogins(ip);
    clearFailedLoginsForUsername(user.username || username);
    const token = createSession(user);
    setSessionCookie(res, req, token);
    await appendAuditLog({
      entityType: "auth",
      entityId: user.id,
      action: "login-success",
      reason: "Autentificare reusita",
      user: user.name || user.username,
      newValue: { username: user.username, ip }
    });

    return sendJson(res, 200, {
      ok: true,
      user: sanitizeUserForSession(user)
    });
  } catch (error) {
    console.error("Failed to login:", error.message);
    return sendJson(res, 500, { error: "Nu am putut procesa autentificarea." });
  }
}

async function logoutHandler(req, res) {
  if (req.currentUser) {
    await appendAuditLog({
      entityType: "auth",
      entityId: req.currentUser.id,
      action: "logout",
      reason: "Iesire din sistem",
      user: req.currentUser.name || req.currentUser.username,
      newValue: { username: req.currentUser.username, ip: getClientIp(req) }
    });
  }

  destroySession(req.sessionToken);
  clearSessionCookie(res, req);
  return sendJson(res, 200, { ok: true });
}

async function meHandler(req, res) {
  if (!req.currentUser) {
    return sendJson(res, 401, { error: "Autentificare necesara." });
  }

  return sendJson(res, 200, {
    ok: true,
    user: sanitizeUserForSession(req.currentUser)
  });
}

async function changePasswordHandler(req, res) {
  if (!req.currentUser) {
    return sendJson(res, 401, { error: "Autentificare necesara." });
  }

  const body = getBody(req);
  const currentPassword = String(body.currentPassword || "");
  const newPassword = String(body.newPassword || "");
  const confirmPassword = String(body.confirmPassword || "");

  if (!currentPassword || !newPassword || !confirmPassword) {
    return sendJson(res, 400, { error: "Toate campurile parolei sunt obligatorii." });
  }

  if (newPassword !== confirmPassword) {
    return sendJson(res, 400, { error: "Confirmarea parolei nu corespunde." });
  }

  try {
    validatePasswordPolicy(newPassword, { mode: "strict" });
  } catch (policyError) {
    return sendJson(res, 400, { error: policyError.message });
  }

  try {
    const fullUser = await findUserByUsername(req.currentUser.username);
    if (!fullUser) {
      return sendJson(res, 404, { error: "Utilizatorul nu a fost gasit." });
    }

    const currentPasswordValid = verifyPassword(
      currentPassword,
      fullUser.passwordSalt,
      fullUser.passwordHash
    );

    if (!currentPasswordValid) {
      await appendAuditLog({
        entityType: "auth",
        entityId: fullUser.id,
        action: "change-password-failed",
        reason: "Parola curenta invalida",
        user: fullUser.name || fullUser.username,
        newValue: { username: fullUser.username, ip: getClientIp(req) }
      });
      return sendJson(res, 400, { error: "Parola curenta este invalida." });
    }

    const updatedUser = await updateUserPasswordById(fullUser.id, newPassword);
    updateSessionUser(fullUser.id, { requirePasswordChange: false });
    await appendAuditLog({
      entityType: "auth",
      entityId: fullUser.id,
      action: "change-password",
      reason: "Parola schimbata de utilizator",
      user: fullUser.name || fullUser.username,
      newValue: { username: fullUser.username, ip: getClientIp(req) }
    });

    return sendJson(res, 200, {
      ok: true,
      user: updatedUser
    });
  } catch (error) {
    console.error("Failed to change password:", error.message);
    return sendJson(res, 500, { error: "Nu am putut schimba parola." });
  }
}

module.exports = {
  changePasswordHandler,
  loginHandler,
  logoutHandler,
  meHandler
};
