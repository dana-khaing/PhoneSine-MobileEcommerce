const test = require("node:test");
const assert = require("node:assert/strict");
const { csrfProtection, securityHeaders } = require("../src/securityMiddleware");

test("sets browser security headers", () => {
  const headers = {};
  securityHeaders({}, { set(values) { Object.assign(headers, values); } }, () => {});
  assert.equal(headers["X-Frame-Options"], "DENY");
  assert.equal(headers["X-Content-Type-Options"], "nosniff");
  assert.match(headers["Content-Security-Policy"], /default-src 'self'/);
});

test("rejects cookie-authenticated mutations without a matching CSRF token", () => {
  const req = { method: "POST", headers: { cookie: "refresh_token=session; csrf_token=expected" } };
  let status;
  csrfProtection(req, { status(code) { status = code; return this; }, send() {} }, () => assert.fail("request should be rejected"));
  assert.equal(status, 403);
});

test("allows cookie-authenticated mutations with a matching CSRF token", () => {
  const req = { method: "POST", headers: { cookie: "refresh_token=session; csrf_token=expected", "x-csrf-token": "expected" } };
  let called = false;
  csrfProtection(req, {}, () => { called = true; });
  assert.equal(called, true);
});
