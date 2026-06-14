const jwt = require("jsonwebtoken");
const { Userdetail } = require("../models");
const { parseCookies } = require("./securityMiddleware");
const { adminRequestPermission, hasPermission } = require("./permissions");

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

function requirePermission(permission) {
  return (req, res, next) => {
    const authorize = async () => {
      try {
        const user = await Userdetail.findByPk(req.user.userId);
        if (!user || !hasPermission(user.role, permission)) return res.status(403).send("Permission denied");
        req.user.role = user.role;
        return next();
      } catch {
        return res.status(500).send("Unable to verify access");
      }
    };
    if (req.user) return authorize();
    return requireAuth(req, res, authorize);
  };
}

function requireAdmin(req, res, next) {
  return requirePermission("*")(req, res, next);
}

function requireAdminRequestPermission(req, res, next) {
  return requirePermission(adminRequestPermission(req.method, req.path))(req, res, next);
}

function requireStaff(req, res, next) {
  return requireAuth(req, res, async () => {
    try {
      const user = await Userdetail.findByPk(req.user.userId);
      if (!user || !hasPermission(user.role, "admin.access")) return res.status(403).send("Staff access required");
      req.user.role = user.role;
      return next();
    } catch {
      return res.status(500).send("Unable to verify staff access");
    }
  });
}

module.exports = { optionalAuth, requireAdmin, requireAdminRequestPermission, requireAuth, requirePermission, requireStaff };
