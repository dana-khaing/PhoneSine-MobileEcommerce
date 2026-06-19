const startedAt = Date.now();
const requests = new Map();
const operationalEvents = new Map();
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

function recordOperationalEvent(name, fields = {}) {
  const normalizedName = String(name || "unknown").replace(/[^a-zA-Z0-9_:.-]/g, "_");
  const severity = fields.severity || "info";
  const key = `${normalizedName}|${severity}`;
  const current = operationalEvents.get(key) || { count: 0, name: normalizedName, severity };
  current.count += 1;
  current.lastSeenAt = new Date().toISOString();
  operationalEvents.set(key, current);
}

function metricsSnapshot() {
  return {
    uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
    unhandledErrors: errors,
    requests: [...requests.entries()].map(([key, value]) => {
      const [method, path, status] = key.split("|");
      return {
        method,
        path,
        status: Number(status),
        count: value.count,
        durationMs: value.durationMs,
        averageDurationMs: Math.round(value.durationMs / value.count),
      };
    }),
    operationalEvents: [...operationalEvents.values()].sort((a, b) => a.name.localeCompare(b.name)),
  };
}

function renderMetrics() {
  const snapshot = metricsSnapshot();
  const lines = [
    "# HELP phone_sine_uptime_seconds Process uptime in seconds",
    "# TYPE phone_sine_uptime_seconds gauge",
    `phone_sine_uptime_seconds ${snapshot.uptimeSeconds}`,
    "# HELP phone_sine_unhandled_errors_total Unhandled request errors",
    "# TYPE phone_sine_unhandled_errors_total counter",
    `phone_sine_unhandled_errors_total ${snapshot.unhandledErrors}`,
    "# HELP phone_sine_http_requests_total HTTP requests",
    "# TYPE phone_sine_http_requests_total counter",
  ];
  for (const [key, value] of requests) {
    const [method, path, status] = key.split("|");
    const labels = `method="${method}",path="${path}",status="${status}"`;
    lines.push(`phone_sine_http_requests_total{${labels}} ${value.count}`);
    lines.push(`phone_sine_http_request_duration_ms_sum{${labels}} ${value.durationMs}`);
  }
  lines.push("# HELP phone_sine_operational_events_total Operational events emitted by the application");
  lines.push("# TYPE phone_sine_operational_events_total counter");
  for (const event of snapshot.operationalEvents) {
    lines.push(`phone_sine_operational_events_total{name="${event.name}",severity="${event.severity}"} ${event.count}`);
  }
  return `${lines.join("\n")}\n`;
}

function resetMetrics() {
  requests.clear();
  operationalEvents.clear();
  errors = 0;
}

module.exports = { metricsSnapshot, recordError, recordOperationalEvent, recordRequest, renderMetrics, resetMetrics };
