const crypto = require("crypto");

function parseCookies(req) {
  return Object.fromEntries(String(req.headers.cookie || "").split(";").filter(Boolean).map((part) => {
    const [key, ...value] = part.trim().split("=");
    return [key, decodeURIComponent(value.join("="))];
  }));
}
function configuredOrigins() {
  return ["FRONTEND_ORIGIN", "FRONTEND_URL", "BACKEND_ORIGIN"]
    .map((key) => process.env[key])
    .filter(Boolean)
    .map((value) => {
      try {
        return new URL(value).origin;
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}
function contentSecurityPolicy() {
  const origins = [...new Set(configuredOrigins())];
  const localApi = process.env.NODE_ENV === "production" ? [] : ["http://localhost:8080"];
  const connectSources = ["'self'", ...origins, ...localApi].join(" ");
  const imageSources = ["'self'", "data:", ...origins, ...localApi].join(" ");
  return [
    "default-src 'self'",
    `connect-src ${connectSources}`,
    `img-src ${imageSources}`,
    "style-src 'self' 'unsafe-inline'",
    "script-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}
function securityHeaders(_req, res, next) {
  const headers = {
    "Content-Security-Policy": contentSecurityPolicy(),
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  };
  if (process.env.NODE_ENV === "production") {
    headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload";
  }
  res.set(headers);
  next();
}
function csrfProtection(req, res, next) {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) return next();
  const cookies = parseCookies(req);
  if (!cookies.refresh_token) return next();
  const supplied = req.headers["x-csrf-token"];
  if (!supplied || !cookies.csrf_token || supplied !== cookies.csrf_token) return res.status(403).send("Invalid CSRF token");
  next();
}
function setSessionCookies(res, session) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  const csrf = crypto.randomBytes(24).toString("hex");
  res.append("Set-Cookie", `refresh_token=${encodeURIComponent(session.refreshToken)}; HttpOnly; SameSite=Strict; Path=/auth${secure}`);
  res.append("Set-Cookie", `access_token=${encodeURIComponent(session.token)}; HttpOnly; SameSite=Strict; Path=/${secure}`);
  res.append("Set-Cookie", `csrf_token=${csrf}; SameSite=Strict; Path=/${secure}`);
}
function clearSessionCookies(res) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.append("Set-Cookie", `refresh_token=; HttpOnly; SameSite=Strict; Path=/auth; Max-Age=0${secure}`);
  res.append("Set-Cookie", `access_token=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure}`);
  res.append("Set-Cookie", `csrf_token=; SameSite=Strict; Path=/; Max-Age=0${secure}`);
}
module.exports = { clearSessionCookies, contentSecurityPolicy, csrfProtection, parseCookies, securityHeaders, setSessionCookies };
