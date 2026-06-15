const crypto = require("crypto");

const SENSITIVE_KEY = /authorization|cookie|password|secret|token|card|payment|email|phone/i;

function sanitize(value, depth = 0) {
  if (depth > 3) return "[truncated]";
  if (typeof value === "string") return value.slice(0, 500);
  if (typeof value !== "object" || value === null) return value;
  if (Array.isArray(value)) return value.slice(0, 10).map((item) => sanitize(item, depth + 1));
  return Object.fromEntries(Object.entries(value).slice(0, 25).map(([key, item]) => [
    key,
    SENSITIVE_KEY.test(key) ? "[redacted]" : sanitize(item, depth + 1),
  ]));
}

function fingerprint(error, context = {}) {
  return crypto.createHash("sha256")
    .update([error?.name, error?.message, context.method, context.path].filter(Boolean).join("|"))
    .digest("hex")
    .slice(0, 16);
}

async function reportError(error, context = {}) {
  if (!process.env.ERROR_TRACKING_WEBHOOK_URL) return false;
  const payload = {
    event: "application_error",
    fingerprint: fingerprint(error, context),
    environment: process.env.NODE_ENV || "development",
    release: process.env.APP_RELEASE || "unknown",
    error: {
      name: String(error?.name || "Error").slice(0, 100),
      message: String(error?.message || "Unknown error").slice(0, 500),
      stack: String(error?.stack || "").split("\n").slice(0, 12).join("\n"),
    },
    context: sanitize(context),
    timestamp: new Date().toISOString(),
  };
  const response = await fetch(process.env.ERROR_TRACKING_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.ok;
}

module.exports = { fingerprint, reportError, sanitize };
