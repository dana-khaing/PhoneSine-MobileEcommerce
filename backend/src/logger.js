function log(level, message, fields = {}) {
  const entry = { timestamp: new Date().toISOString(), level, message, ...fields };
  console[level === "error" ? "error" : "log"](JSON.stringify(entry));
}
function requestLogger(req, res, next) {
  const startedAt = Date.now();
  res.on("finish", () => log("info", "http_request", { method: req.method, path: req.path, status: res.statusCode, durationMs: Date.now() - startedAt }));
  next();
}
function errorHandler(error, req, res, _next) {
  log("error", "unhandled_request_error", { method: req.method, path: req.path, error: error.message });
  res.status(500).send("Internal server error");
}
module.exports = { errorHandler, log, requestLogger };
