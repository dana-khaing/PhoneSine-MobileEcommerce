const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const { authorizationUrl } = require("../src/oauthService");

test("builds OAuth authorization URLs with signed state", () => {
  const original = {
    clientId: process.env.OAUTH_GOOGLE_CLIENT_ID,
    clientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET,
    jwtSecret: process.env.JWT_SECRET,
  };
  process.env.OAUTH_GOOGLE_CLIENT_ID = "client";
  process.env.OAUTH_GOOGLE_CLIENT_SECRET = "secret";
  process.env.JWT_SECRET = "jwt-secret";
  try {
    const url = new URL(authorizationUrl("google", 42));
    assert.equal(url.origin, "https://accounts.google.com");
    assert.equal(url.searchParams.get("client_id"), "client");
    const state = jwt.verify(url.searchParams.get("state"), "jwt-secret");
    assert.equal(state.provider, "google");
    assert.equal(state.linkUserId, 42);
    assert.equal(typeof state.iat, "number");
    assert.equal(typeof state.exp, "number");
  } finally {
    Object.entries(original).forEach(([key, value]) => {
      const envKey = { clientId: "OAUTH_GOOGLE_CLIENT_ID", clientSecret: "OAUTH_GOOGLE_CLIENT_SECRET", jwtSecret: "JWT_SECRET" }[key];
      if (value) process.env[envKey] = value;
      else delete process.env[envKey];
    });
  }
});

test("rejects unsupported OAuth providers", () => {
  assert.throws(() => authorizationUrl("unknown"), /Unsupported OAuth provider/);
});
