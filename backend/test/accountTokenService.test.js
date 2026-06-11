const test = require("node:test");
const assert = require("node:assert/strict");
const { createAccountToken, hashAccountToken } = require("../src/accountTokenService");

test("creates random account tokens and stores only deterministic hashes", () => {
  const first = createAccountToken();
  const second = createAccountToken();
  assert.notEqual(first.token, second.token);
  assert.equal(first.tokenHash, hashAccountToken(first.token));
  assert.equal(first.token.length, 64);
});
