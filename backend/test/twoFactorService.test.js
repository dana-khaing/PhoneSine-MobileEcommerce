const test = require("node:test");
const assert = require("node:assert/strict");
const { codeFor, consumeRecoveryCode, generateSecret, verifyCode } = require("../src/twoFactorService");
test("generates and verifies time-based two-factor codes", () => {
  const secret = generateSecret();
  const timestamp = 1710000000000;
  assert.equal(verifyCode(secret, codeFor(secret, timestamp), timestamp), true);
  assert.equal(verifyCode(secret, "000000", timestamp), false);
});

test("consumes recovery codes exactly once", () => {
  const result = consumeRecoveryCode(["FIRST", "SECOND"], " first ");
  assert.equal(result.used, true);
  assert.deepEqual(result.remaining, ["SECOND"]);
  assert.equal(consumeRecoveryCode(result.remaining, "FIRST").used, false);
});
