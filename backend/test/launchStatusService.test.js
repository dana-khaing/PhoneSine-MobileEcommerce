const test = require("node:test");
const assert = require("node:assert/strict");
const { launchStatus, providerStatuses } = require("../src/launchStatusService");

const readyEnv = {
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
  DATABASE_URL: "mysql://user:pass@db.phonesine.com:3306/phone_sine",
  EMAIL_WEBHOOK_URL: "https://email.phonesine.com/send",
  OPERATIONS_ALERT_WEBHOOK_URL: "https://ops.phonesine.com/hook",
  ERROR_TRACKING_WEBHOOK_URL: "https://errors.phonesine.com/ingest",
  TURNSTILE_SECRET_KEY: "turnstile-secret",
  RUN_IN_PROCESS_JOBS: "true",
};

test("launch status exposes readiness without secret values", () => {
  const status = launchStatus(readyEnv);
  assert.equal(status.ready, true);
  assert.equal(status.checklist.items.find((item) => item.id === "readiness").done, true);
  assert.deepEqual(status.blockers, []);
  assert.doesNotMatch(JSON.stringify(status), /sk_live_real|mysql:\/\/user:pass/);
});

test("launch status includes blockers for incomplete environments", () => {
  const status = launchStatus({});
  assert.equal(status.ready, false);
  assert(status.blockers.some((item) => item.includes("JWT_SECRET")));
  assert.equal(status.checklist.completed, 0);
});

test("provider status reports configured counts only", () => {
  const providers = providerStatuses({ STRIPE_SECRET_KEY: "sk_live_real", STRIPE_WEBHOOK_SECRET: "whsec_real" });
  const stripe = providers.find((provider) => provider.id === "stripe");
  assert.deepEqual(stripe, { id: "stripe", label: "Stripe", configured: 2, total: 2, ready: true });
});
