const crypto = require("crypto");

const SESSION_COOKIE_NAME = "agro_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;
const LOGIN_WINDOW_MS = 1000 * 60 * 15;
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_BLOCK_MS = 1000 * 60 * 15;

const sessions = new Map();
const loginAttemptsByIp = new Map();
const loginAttemptsByUsername = new Map();

function createPasswordRecord(password) {
  const normalizedPassword = String(password || "").trim();
  if (!normalizedPassword) {
    throw new Error("Parola este obligatorie.");
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(normalizedPassword, salt, 64).toString("hex");

  return { salt, hash };
}

function verifyPassword(password, salt, hash) {
  const normalizedPassword = String(password || "");
  if (!normalizedPassword || !salt || !hash) {
    return false;
  }

  const calculatedHash = crypto.scryptSync(normalizedPassword, salt, 64);
  const storedHash = Buffer.from(String(hash), "hex");

  if (calculatedHash.length !== storedHash.length) {
    return false;
  }

  return crypto.timingSafeEqual(calculatedHash, storedHash);
}

function sanitizeUserForSession(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    roleCode: user.roleCode,
    channel: user.channel,
    active: user.active !== false
  };
}

function parseCookies(cookieHeader = "") {
  return String(cookieHeader || "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .reduce((acc, item) => {
      const separatorIndex = item.indexOf("=");
      if (separatorIndex < 0) {
        return acc;
      }

      const key = item.slice(0, separatorIndex).trim();
      const value = item.slice(separatorIndex + 1).trim();
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {});
}

function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (!session || session.expiresAt <= now) {
      sessions.delete(token);
    }
  }
}

function buildCookie(token, req, maxAgeMs = SESSION_TTL_MS) {
  const forwardedProto = String(req.headers["x-forwarded-proto"] || "").toLowerCase();
  const isSecure = Boolean(req.secure || forwardedProto === "https" || process.env.NODE_ENV === "production");
  const attributes = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    `Max-Age=${Math.floor(maxAgeMs / 1000)}`
  ];

  if (isSecure) {
    attributes.push("Secure");
  }

  return attributes.join("; ");
}

function setSessionCookie(res, req, token) {
  res.setHeader("Set-Cookie", buildCookie(token, req));
}

function clearSessionCookie(res, req) {
  res.setHeader("Set-Cookie", buildCookie("", req, 0));
}

function createSession(user) {
  cleanupExpiredSessions();
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, {
    user: sanitizeUserForSession(user),
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL_MS
  });
  return token;
}

function destroySession(token) {
  if (token) {
    sessions.delete(token);
  }
}

function getClientIp(req) {
  const forwardedFor = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return forwardedFor || req.socket?.remoteAddress || "unknown";
}

function getAttemptState(store, key) {
  const normalizedKey = String(key || "").trim().toLowerCase();
  if (!normalizedKey) {
    return null;
  }

  return {
    store,
    normalizedKey,
    current:
      store.get(normalizedKey) || {
        count: 0,
        firstAttemptAt: Date.now(),
        blockedUntil: 0
      }
  };
}

function registerFailedAttempt(store, key) {
  const attemptState = getAttemptState(store, key);
  if (!attemptState) {
    return null;
  }

  const now = Date.now();
  const current = attemptState.current;

  if (current.blockedUntil > now) {
    return current;
  }

  if (now - current.firstAttemptAt > LOGIN_WINDOW_MS) {
    current.count = 0;
    current.firstAttemptAt = now;
  }

  current.count += 1;

  if (current.count >= LOGIN_MAX_ATTEMPTS) {
    current.blockedUntil = now + LOGIN_BLOCK_MS;
    current.count = 0;
    current.firstAttemptAt = now;
  }

  attemptState.store.set(attemptState.normalizedKey, current);
  return current;
}

function registerFailedLogin(ip) {
  return registerFailedAttempt(loginAttemptsByIp, ip);
}

function registerFailedLoginForUsername(username) {
  return registerFailedAttempt(loginAttemptsByUsername, username);
}

function clearFailedAttempt(store, key) {
  const normalizedKey = String(key || "").trim().toLowerCase();
  if (!normalizedKey) {
    return;
  }

  store.delete(normalizedKey);
}

function clearFailedLogins(ip) {
  clearFailedAttempt(loginAttemptsByIp, ip);
}

function clearFailedLoginsForUsername(username) {
  clearFailedAttempt(loginAttemptsByUsername, username);
}

function isBlocked(store, key) {
  const normalizedKey = String(key || "").trim().toLowerCase();
  if (!normalizedKey) {
    return { blocked: false, retryAfterMs: 0 };
  }

  const current = store.get(normalizedKey);
  if (!current) {
    return { blocked: false, retryAfterMs: 0 };
  }

  if (current.blockedUntil > Date.now()) {
    return {
      blocked: true,
      retryAfterMs: current.blockedUntil - Date.now()
    };
  }

  return { blocked: false, retryAfterMs: 0 };
}

function isLoginBlocked(ip) {
  return isBlocked(loginAttemptsByIp, ip);
}

function isUsernameBlocked(username) {
  return isBlocked(loginAttemptsByUsername, username);
}

function listUsernameLockouts() {
  const now = Date.now();
  const lockouts = [];

  for (const [username, state] of loginAttemptsByUsername.entries()) {
    if (state?.blockedUntil > now) {
      lockouts.push({
        username,
        retryAfterMs: state.blockedUntil - now,
        blockedUntil: new Date(state.blockedUntil).toISOString()
      });
    }
  }

  return lockouts.sort((a, b) => a.username.localeCompare(b.username, "ro"));
}

function unlockUsername(username) {
  clearFailedAttempt(loginAttemptsByUsername, username);
}

function attachCurrentUser(req, _res, next) {
  cleanupExpiredSessions();
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[SESSION_COOKIE_NAME];

  req.sessionToken = token || "";
  req.currentUser = null;

  if (token && sessions.has(token)) {
    const session = sessions.get(token);
    if (session?.expiresAt > Date.now()) {
      req.currentUser = session.user;
    } else {
      sessions.delete(token);
    }
  }

  next();
}

function requireAuth(req, res, next) {
  if (req.currentUser) {
    return next();
  }

  return res.status(401).json({ error: "Autentificare necesara." });
}

function requireRoles(allowedRoles = []) {
  const normalizedRoles = allowedRoles.map((item) => String(item || "").trim()).filter(Boolean);

  return (req, res, next) => {
    if (!req.currentUser) {
      return res.status(401).json({ error: "Autentificare necesara." });
    }

    if (normalizedRoles.includes(req.currentUser.roleCode)) {
      return next();
    }

    return res.status(403).json({ error: "Nu ai drepturi pentru aceasta operatiune." });
  };
}

function getActorLabel(req) {
  return req.currentUser?.name || req.currentUser?.username || "sistem";
}

module.exports = {
  SESSION_COOKIE_NAME,
  attachCurrentUser,
  clearFailedLogins,
  clearFailedLoginsForUsername,
  clearSessionCookie,
  createPasswordRecord,
  createSession,
  destroySession,
  getActorLabel,
  getClientIp,
  isLoginBlocked,
  isUsernameBlocked,
  listUsernameLockouts,
  registerFailedLogin,
  registerFailedLoginForUsername,
  requireAuth,
  requireRoles,
  sanitizeUserForSession,
  setSessionCookie,
  unlockUsername,
  verifyPassword
};
