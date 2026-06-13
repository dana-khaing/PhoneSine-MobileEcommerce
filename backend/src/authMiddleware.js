const jwt = require("jsonwebtoken");
const { Userdetail } = require("../models");
const { parseCookies } = require("./securityMiddleware");

function readUser(req) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "") || parseCookies(req).access_token;
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
  return requireAuth(req, res, async () => {
    try {
      const user = await Userdetail.findByPk(req.user.userId);
      if (!user || user.role !== "admin") return res.status(403).send("Admin access required");
      req.user.role = user.role;
      return next();
    } catch {
      return res.status(500).send("Unable to verify admin access");
    }
  });
}

module.exports = { optionalAuth, requireAdmin, requireAuth };
