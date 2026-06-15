const test = require("node:test");
const assert = require("node:assert/strict");
const { fingerprint, reportError, sanitize } = require("../src/errorTrackingService");

test("sanitizes sensitive error context", () => {
  assert.deepEqual(sanitize({
    path: "/checkout",
    authorization: "Bearer secret",
    customer: { email: "customer@example.com", id: 7 },
  }), {
    path: "/checkout",
    authorization: "[redacted]",
    customer: { email: "[redacted]", id: 7 },
  });
});

test("creates stable error fingerprints", () => {
  const error = new Error("database unavailable");
  assert.equal(fingerprint(error, { method: "GET", path: "/products" }), fingerprint(error, { method: "GET", path: "/products" }));
});

test("posts sanitized error reports when configured", async () => {
  const originalUrl = process.env.ERROR_TRACKING_WEBHOOK_URL;
  const originalFetch = global.fetch;
  process.env.ERROR_TRACKING_WEBHOOK_URL = "https://errors.example.test/report";
  let body;
  global.fetch = async (_url, options) => {
    body = JSON.parse(options.body);
    return { ok: true };
  };
  try {
    assert.equal(await reportError(new Error("failed"), { token: "secret", path: "/test" }), true);
    assert.equal(body.context.token, "[redacted]");
    assert.equal(body.context.path, "/test");
    assert.equal(body.event, "application_error");
  } finally {
    global.fetch = originalFetch;
    if (originalUrl) process.env.ERROR_TRACKING_WEBHOOK_URL = originalUrl;
    else delete process.env.ERROR_TRACKING_WEBHOOK_URL;
  }
});
