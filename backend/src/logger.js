const { sendOperationalAlert } = require("./alertService");
const { reportError } = require("./errorTrackingService");
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
  const context = { method: req.method, path: req.path };
  log("error", "unhandled_request_error", { ...context, error: error.message });
  sendOperationalAlert("unhandled_request_error", { ...context, error: error.message }).catch(() => {});
  reportError(error, context).catch(() => {});
  res.status(500).send("Internal server error");
}
module.exports = { errorHandler, log, requestLogger };
