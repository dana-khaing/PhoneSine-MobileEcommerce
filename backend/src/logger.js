const { sendOperationalAlert } = require("./alertService");
const { recordError, recordRequest } = require("./metricsService");

function log(level, message, fields = {}) {
  const entry = { timestamp: new Date().toISOString(), level, message, ...fields };
  console[level === "error" ? "error" : "log"](JSON.stringify(entry));
}
function requestLogger(req, res, next) {
  const startedAt = Date.now();
  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    recordRequest(req.method, req.route?.path || req.path, res.statusCode, durationMs);
    log("info", "http_request", { method: req.method, path: req.path, status: res.statusCode, durationMs });
  });
  next();
}
function errorHandler(error, req, res, _next) {
  recordError();
  log("error", "unhandled_request_error", { method: req.method, path: req.path, error: error.message });
  sendOperationalAlert("unhandled_request_error", { method: req.method, path: req.path, error: error.message }).catch(() => {});
  res.status(500).send("Internal server error");
}
module.exports = { errorHandler, log, requestLogger };
