const jwt = require("jsonwebtoken");

function readUser(req) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return null;

  return jwt.verify(token, process.env.JWT_SECRET);
}

function requireAuth(req, res, next) {
  try {
    req.user = readUser(req);
    if (!req.user) return res.status(401).send("Authentication required");
    return next();
  } catch {
    return res.status(401).send("Invalid or expired token");
  }
}

function optionalAuth(req, res, next) {
  try {
    req.user = readUser(req);
    return next();
  } catch {
    return res.status(401).send("Invalid or expired token");
  }
}

function requireAdmin(req, res, next) {
  return requireAuth(req, res, () => {
    const admins = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);
    if (!admins.includes(req.user.email.toLowerCase())) {
      return res.status(403).send("Admin access required");
    }
    return next();
  });
}

module.exports = { optionalAuth, requireAdmin, requireAuth };
