// Production security headers, NoSQL injection sanitizer, and in-memory rate limiter

const securityHeaders = (req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  res.removeHeader("X-Powered-By");
  next();
};

// Recursively strip MongoDB operator keys ($...) and prototype pollution keys
const cleanObject = (obj) => {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(cleanObject);

  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (
      key.startsWith("$") ||
      key.includes(".") ||
      key === "__proto__" ||
      key === "constructor" ||
      key === "prototype"
    ) {
      continue;
    }
    cleaned[key] = cleanObject(value);
  }
  return cleaned;
};

const sanitizeRequest = (req, res, next) => {
  if (req.body && typeof req.body === "object") req.body = cleanObject(req.body);
  if (req.query && typeof req.query === "object") req.query = cleanObject(req.query);
  if (req.params && typeof req.params === "object") req.params = cleanObject(req.params);
  next();
};

const createRateLimiter = ({
  windowMs = 15 * 60 * 1000,
  max = 100,
  message = "Too many requests, please try again later.",
} = {}) => {
  const hits = new Map();

  const interval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits.entries()) {
      if (now > entry.resetAt) hits.delete(key);
    }
  }, windowMs);
  if (interval.unref) interval.unref();

  return (req, res, next) => {
    const key = req.ip || req.connection?.remoteAddress || "unknown";
    const now = Date.now();
    let entry = hits.get(key);

    if (!entry || now > entry.resetAt) {
      entry = { count: 1, resetAt: now + windowMs };
      hits.set(key, entry);
      return next();
    }

    entry.count += 1;
    if (entry.count > max) {
      return res.status(429).json({ message });
    }
    return next();
  };
};

module.exports = { securityHeaders, sanitizeRequest, createRateLimiter };
