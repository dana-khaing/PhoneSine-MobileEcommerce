const test = require("node:test"); const assert = require("node:assert/strict"); const { errorHandler } = require("../src/logger");
test("returns a generic response for unhandled errors", () => {
  let result; errorHandler(new Error("secret detail"), { method: "GET", path: "/test" }, { status: (status) => ({ send: (body) => { result = { status, body }; } }) }, () => {});
  assert.deepEqual(result, { status: 500, body: "Internal server error" });
});
