const test = require("node:test");
const assert = require("node:assert/strict");
const { verifyBotToken } = require("../src/botProtection");

test("skips bot verification when Turnstile is not configured", async () => {
  const original = process.env.TURNSTILE_SECRET_KEY;
  delete process.env.TURNSTILE_SECRET_KEY;
  try {
    assert.equal(await verifyBotToken(), true);
  } finally {
    if (original) process.env.TURNSTILE_SECRET_KEY = original;
  }
});

test("requires a bot token when Turnstile is configured", async () => {
  const original = process.env.TURNSTILE_SECRET_KEY;
  process.env.TURNSTILE_SECRET_KEY = "secret";
  try {
    await assert.rejects(verifyBotToken(), /Bot verification required/);
  } finally {
    if (original) process.env.TURNSTILE_SECRET_KEY = original;
    else delete process.env.TURNSTILE_SECRET_KEY;
  }
});
