const test = require("node:test");
const assert = require("node:assert/strict");
const { decrypt, encrypt } = require("../src/secretEncryption");

test("encrypts MFA secrets at rest", () => {
  process.env.MFA_ENCRYPTION_KEY = "test-only-encryption-key";
  const encrypted = encrypt("secret");
  assert.notEqual(encrypted, "secret");
  assert.equal(decrypt(encrypted), "secret");
});

test("reads legacy plaintext MFA secrets during migration", () => {
  assert.equal(decrypt("legacy-secret"), "legacy-secret");
});
