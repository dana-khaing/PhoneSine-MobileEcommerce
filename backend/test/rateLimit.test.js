const test = require("node:test");
const assert = require("node:assert/strict");
const { createRateLimiter } = require("../src/rateLimit");

test("limits excessive requests from the same client", () => {
  const limiter = createRateLimiter({ windowMs: 1000, max: 1 });
  const req = { ip: "127.0.0.1" };
  let status;
  const res = {
    status(code) {
      status = code;
      return this;
    },
    send() {},
  };
  let nextCalls = 0;
  limiter(req, res, () => nextCalls++);
  limiter(req, res, () => nextCalls++);
  assert.equal(nextCalls, 1);
  assert.equal(status, 429);
});
