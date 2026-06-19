const test = require("node:test");
const assert = require("node:assert/strict");
const { csrfProtection, securityHeaders } = require("../src/securityMiddleware");

test("sets browser security headers", () => {
  const headers = {};
  securityHeaders({}, { set(values) { Object.assign(headers, values); } }, () => {});
  assert.equal(headers["X-Frame-Options"], "DENY");
  assert.equal(headers["X-Content-Type-Options"], "nosniff");
  assert.match(headers["Content-Security-Policy"], /default-src 'self'/);
  assert.match(headers["Content-Security-Policy"], /connect-src 'self'/);
});

test("sets production transport security and configured CSP origins", () => {
  const previous = {
    NODE_ENV: process.env.NODE_ENV,
    FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN,
    BACKEND_ORIGIN: process.env.BACKEND_ORIGIN,
  };
  process.env.NODE_ENV = "production";
  process.env.FRONTEND_ORIGIN = "https://phonesine.com";
  process.env.BACKEND_ORIGIN = "https://api.phonesine.com";
  const headers = {};
  securityHeaders({}, { set(values) { Object.assign(headers, values); } }, () => {});
  assert.equal(headers["Strict-Transport-Security"], "max-age=31536000; includeSubDomains; preload");
  assert.match(headers["Content-Security-Policy"], /connect-src 'self' https:\/\/phonesine\.com https:\/\/api\.phonesine\.com/);
  assert.doesNotMatch(headers["Content-Security-Policy"], /localhost/);
  for (const [key, value] of Object.entries(previous)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
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
