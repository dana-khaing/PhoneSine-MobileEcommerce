const test = require("node:test");
const assert = require("node:assert/strict");
const { recordError, recordRequest, renderMetrics, resetMetrics } = require("../src/metricsService");

test("renders Prometheus request and error metrics", () => {
  resetMetrics();
  recordRequest("GET", "/health", 200, 12);
  recordError();
  const output = renderMetrics();
  assert.match(output, /phone_sine_http_requests_total\{method="GET",path="\/health",status="200"\} 1/);
  assert.match(output, /phone_sine_http_request_duration_ms_sum.* 12/);
  assert.match(output, /phone_sine_unhandled_errors_total 1/);
});
