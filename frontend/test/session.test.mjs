import test from "node:test";
import assert from "node:assert/strict";

test("refresh session module exports browser session helpers", async () => {
  const module = await import("../src/app/components/auth/session.mjs");
  assert.equal(typeof module.storeSession, "function");
  assert.equal(typeof module.refreshSession, "function");
  assert.equal(typeof module.clearSession, "function");
});
