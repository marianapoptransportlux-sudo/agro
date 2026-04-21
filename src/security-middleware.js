const IS_PRODUCTION = process.env.NODE_ENV === "production";
const FORCE_HTTPS = IS_PRODUCTION || process.env.FORCE_HTTPS === "true";
const ALLOWED_ORIGINS = String(process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function isSecureRequest(req) {
  if (req.secure) return true;
  const forwarded = String(req.headers["x-forwarded-proto"] || "").toLowerCase();
  return forwarded === "https";
}

function httpsRedirectAndHstsMiddleware(req, res, next) {
  if (FORCE_HTTPS) {
    if (!isSecureRequest(req)) {
      const host = req.headers.host || "";
      return res.redirect(301, `https://${host}${req.originalUrl}`);
    }
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }
  next();
}

function sameOriginOrEmpty(req) {
  const origin = req.headers.origin || "";
  const referer = req.headers.referer || "";
  const host = req.headers.host || "";
  const candidate = origin || referer;
  if (!candidate) {
    return true;
  }
  try {
    const parsed = new URL(candidate);
    if (parsed.host === host) return true;
    if (ALLOWED_ORIGINS.includes(parsed.origin)) return true;
    if (ALLOWED_ORIGINS.includes(`${parsed.protocol}//${parsed.host}`)) return true;
    return false;
  } catch (_err) {
    return false;
  }
}

function csrfOriginGuardMiddleware(req, res, next) {
  const method = String(req.method || "GET").toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return next();
  }
  if (sameOriginOrEmpty(req)) {
    return next();
  }
  return res
    .status(403)
    .json({ error: "Cerere respinsa: origine invalida (CSRF guard)." });
}

function createRateLimiter({ windowMs, max, keyFn, message }) {
  const store = new Map();
  const getKey = typeof keyFn === "function" ? keyFn : (req) => req.ip || "unknown";

  function prune(now) {
    for (const [k, v] of store.entries()) {
      if (!v || v.resetAt <= now) {
        store.delete(k);
      }
    }
  }

  return function rateLimitMiddleware(req, res, next) {
    const now = Date.now();
    prune(now);
    const key = String(getKey(req) || "unknown");
    const entry = store.get(key) || { count: 0, resetAt: now + windowMs };
    if (entry.resetAt <= now) {
      entry.count = 0;
      entry.resetAt = now + windowMs;
    }
    entry.count += 1;
    store.set(key, entry);
    if (entry.count > max) {
      const retryAfterSec = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
      res.setHeader("Retry-After", String(retryAfterSec));
      return res.status(429).json({
        error:
          message ||
          `Prea multe cereri. Reincearca peste ${Math.ceil(retryAfterSec / 60)} minute.`
      });
    }
    return next();
  };
}

function clientIp(req) {
  const forwardedFor = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return forwardedFor || req.socket?.remoteAddress || "unknown";
}

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyFn: (req) => clientIp(req),
  message: "Prea multe incercari de autentificare. Reincearca in 15 minute."
});

const mutationLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 120,
  keyFn: (req) => `${clientIp(req)}:${req.currentUser?.id || ""}`,
  message: "Prea multe operatiuni intr-un interval scurt. Reincearca mai tarziu."
});

module.exports = {
  IS_PRODUCTION,
  FORCE_HTTPS,
  authLimiter,
  createRateLimiter,
  csrfOriginGuardMiddleware,
  httpsRedirectAndHstsMiddleware,
  mutationLimiter
};
