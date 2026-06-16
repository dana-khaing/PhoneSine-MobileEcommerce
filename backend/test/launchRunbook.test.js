const test = require("node:test");
const assert = require("node:assert/strict");
const { generateLaunchRunbook } = require("../src/launchRunbook");

test("generates a phased launch runbook with readiness results", () => {
  const runbook = generateLaunchRunbook({
    NODE_ENV: "production",
    BACKEND_ORIGIN: "https://api.phonesine.com",
    FRONTEND_ORIGIN: "https://phonesine.com",
    FRONTEND_URL: "https://phonesine.com",
    JWT_SECRET: "a".repeat(32),
    MFA_ENCRYPTION_KEY: "b".repeat(32),
    METRICS_TOKEN: "metrics-token",
    STRIPE_SECRET_KEY: "sk_live_real",
    STRIPE_WEBHOOK_SECRET: "whsec_real",
    ADMIN_EMAILS: "admin@phonesine.com",
    DATABASE_URL: "mysql://user:pass@db.example.com:3306/phone_sine",
    RUN_IN_PROCESS_JOBS: "true",
  });
  assert.match(runbook, /Production readiness: ready/);
  assert.match(runbook, /## Provider setup/);
  assert.match(runbook, /Stripe live keys/);
  assert.doesNotMatch(runbook, /sk_live_real/);
});

test("includes blockers for incomplete launch environments", () => {
  const runbook = generateLaunchRunbook({});
  assert.match(runbook, /Production readiness: blocked/);
  assert.match(runbook, /## Readiness Blockers/);
  assert.match(runbook, /JWT_SECRET is required/);
});
