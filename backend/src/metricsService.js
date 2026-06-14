const startedAt = Date.now();
const requests = new Map();
let errors = 0;

function recordRequest(method, path, status, durationMs) {
  const key = `${method}|${path}|${status}`;
  const current = requests.get(key) || { count: 0, durationMs: 0 };
  current.count += 1;
  current.durationMs += durationMs;
  requests.set(key, current);
}

function recordError() {
  errors += 1;
}

function renderMetrics() {
  const lines = [
    "# HELP phone_sine_uptime_seconds Process uptime in seconds",
    "# TYPE phone_sine_uptime_seconds gauge",
    `phone_sine_uptime_seconds ${Math.floor((Date.now() - startedAt) / 1000)}`,
    "# HELP phone_sine_unhandled_errors_total Unhandled request errors",
    "# TYPE phone_sine_unhandled_errors_total counter",
    `phone_sine_unhandled_errors_total ${errors}`,
    "# HELP phone_sine_http_requests_total HTTP requests",
    "# TYPE phone_sine_http_requests_total counter",
  ];
  for (const [key, value] of requests) {
    const [method, path, status] = key.split("|");
    const labels = `method="${method}",path="${path}",status="${status}"`;
    lines.push(`phone_sine_http_requests_total{${labels}} ${value.count}`);
    lines.push(`phone_sine_http_request_duration_ms_sum{${labels}} ${value.durationMs}`);
  }
  return `${lines.join("\n")}\n`;
}

function resetMetrics() {
  requests.clear();
  errors = 0;
}

module.exports = { recordError, recordRequest, renderMetrics, resetMetrics };
