const crypto = require("crypto");

const DEFAULT_USER_PASSWORD = "Agro2026!";
const SESSION_COOKIE_NAME = "elevator_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

const sessions = new Map();
const loginAttempts = new Map();

function slugifyUsername(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "") || "user";
}

function createPasswordRecord(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return {
    passwordSalt: salt,
    passwordHash: hash
  };
}

function verifyPassword(password, passwordSalt, passwordHash) {
  const expected = crypto.scryptSync(String(password), String(passwordSalt), 64);
  const actual = Buffer.from(String(passwordHash), "hex");

  if (expected.length !== actual.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, actual);
}

function parseCookies(cookieHeader = "") {
  return String(cookieHeader)
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .reduce((acc, item) => {
      const separatorIndex = item.indexOf("=");
      if (separatorIndex === -1) {
        return acc;
      }

      const key = item.slice(0, separatorIndex).trim();
      const value = item.slice(separatorIndex + 1).trim();
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {});
}

function serializeCookie(name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${Math.floor(options.maxAge / 1000)}`);
  }

  parts.push(`Path=${options.path || "/"}`);
  parts.push(`SameSite=${options.sameSite || "Strict"}`);

  if (options.httpOnly !== false) {
    parts.push("HttpOnly");
  }

  if (options.secure) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

function createSession(user) {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, {
    token,
    userId: user.id,
    username: user.username,
    name: user.name,
    roleCode: user.roleCode,
    expiresAt: Date.now() + SESSION_TTL_MS
  });
  return token;
}

function getSessionFromRequest(req) {
  const cookies = parseCookies(req.headers?.cookie || "");
  const token = cookies[SESSION_COOKIE_NAME];

  if (!token) {
    return null;
  }

  const session = sessions.get(token);
  if (!session) {
    return null;
  }

  if (session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }

  session.expiresAt = Date.now() + SESSION_TTL_MS;
  return session;
}

function destroySessionFromRequest(req) {
  const cookies = parseCookies(req.headers?.cookie || "");
  const token = cookies[SESSION_COOKIE_NAME];
  if (token) {
    sessions.delete(token);
  }
}

function isSecureCookieEnabled() {
  return process.env.NODE_ENV === "production" || process.env.FORCE_SECURE_COOKIES === "true";
}

function setSessionCookie(res, token) {
  res.setHeader(
    "Set-Cookie",
    serializeCookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "Strict",
      secure: isSecureCookieEnabled(),
      maxAge: SESSION_TTL_MS,
      path: "/"
    })
  );
}

function clearSessionCookie(res) {
  res.setHeader(
    "Set-Cookie",
    serializeCookie(SESSION_COOKIE_NAME, "", {
      httpOnly: true,
      sameSite: "Strict",
      secure: isSecureCookieEnabled(),
      maxAge: 0,
      path: "/"
    })
  );
}

function recordLoginFailure(ipAddress) {
  const entry = loginAttempts.get(ipAddress) || {
    count: 0,
    firstAttemptAt: Date.now(),
    blockedUntil: 0
  };

  if (Date.now() - entry.firstAttemptAt > 1000 * 60 * 15) {
    entry.count = 0;
    entry.firstAttemptAt = Date.now();
    entry.blockedUntil = 0;
  }

  entry.count += 1;
  if (entry.count >= 5) {
    entry.blockedUntil = Date.now() + 1000 * 60 * 15;
  }

  loginAttempts.set(ipAddress, entry);
}

function clearLoginFailures(ipAddress) {
  loginAttempts.delete(ipAddress);
}

function isLoginBlocked(ipAddress) {
  const entry = loginAttempts.get(ipAddress);
  if (!entry) {
    return false;
  }

  if (entry.blockedUntil && entry.blockedUntil > Date.now()) {
    return true;
  }

  if (entry.blockedUntil && entry.blockedUntil <= Date.now()) {
    loginAttempts.delete(ipAddress);
  }

  return false;
}

function attachCurrentUser(req, _res, next) {
  req.currentUser = getSessionFromRequest(req);
  next();
}

function requireAuth(req, res, next) {
  if (!req.currentUser) {
    res.statusCode = 401;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Autentificare necesara." }));
    return;
  }

  next();
}

module.exports = {
  DEFAULT_USER_PASSWORD,
  attachCurrentUser,
  clearLoginFailures,
  clearSessionCookie,
  createPasswordRecord,
  createSession,
  destroySessionFromRequest,
  getSessionFromRequest,
  isLoginBlocked,
  parseCookies,
  requireAuth,
  setSessionCookie,
  slugifyUsername,
  verifyPassword
};
