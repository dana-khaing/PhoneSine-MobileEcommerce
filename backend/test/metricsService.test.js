const test = require("node:test");
const assert = require("node:assert/strict");
const { metricsSnapshot, recordError, recordOperationalEvent, recordRequest, renderMetrics, resetMetrics } = require("../src/metricsService");

test("renders Prometheus request and error metrics", () => {
  resetMetrics();
  recordRequest("GET", "/health", 200, 12);
  recordError();
  recordOperationalEvent("checkout.completed", { severity: "info" });
  const output = renderMetrics();
  assert.match(output, /phone_sine_http_requests_total\{method="GET",path="\/health",status="200"\} 1/);
  assert.match(output, /phone_sine_http_request_duration_ms_sum.* 12/);
  assert.match(output, /phone_sine_unhandled_errors_total 1/);
  assert.match(output, /phone_sine_operational_events_total\{name="checkout.completed",severity="info"\} 1/);
});

test("returns a JSON metrics snapshot for admin observability", () => {
  resetMetrics();
  recordRequest("POST", "/create-checkout-session", 201, 42);
  recordOperationalEvent("stripe webhook failed", { severity: "error" });
  const snapshot = metricsSnapshot();
  assert.equal(snapshot.requests[0].averageDurationMs, 42);
  assert.deepEqual(snapshot.operationalEvents[0], {
    name: "stripe_webhook_failed",
    severity: "error",
    count: 1,
    lastSeenAt: snapshot.operationalEvents[0].lastSeenAt,
  });
});
