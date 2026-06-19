const test = require("node:test");
const assert = require("node:assert/strict");
const { checkProductionReadiness } = require("../src/productionReadiness");

const validEnv = {
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
  EMAIL_WEBHOOK_URL: "https://email.phonesine.com/send",
  OPERATIONS_ALERT_WEBHOOK_URL: "https://ops.phonesine.com/hook",
  ERROR_TRACKING_WEBHOOK_URL: "https://errors.phonesine.com/ingest",
  TURNSTILE_SECRET_KEY: "turnstile-secret",
  RUN_IN_PROCESS_JOBS: "true",
};

test("accepts a complete production environment", () => {
  const result = checkProductionReadiness(validEnv);
  assert.equal(result.ready, true);
  assert.deepEqual(result.blockers, []);
});

test("rejects placeholders, weak secrets, and non-live Stripe keys", () => {
  const result = checkProductionReadiness({
    ...validEnv,
    JWT_SECRET: "short",
    MFA_ENCRYPTION_KEY: "short",
    STRIPE_SECRET_KEY: "sk_test_replace_me",
    BACKEND_ORIGIN: "http://localhost:8080",
  });
  assert.equal(result.ready, false);
  assert(result.blockers.some((item) => item.includes("JWT_SECRET")));
  assert(result.blockers.some((item) => item.includes("MFA_ENCRYPTION_KEY")));
  assert(result.blockers.some((item) => item.includes("STRIPE_SECRET_KEY")));
  assert(result.blockers.some((item) => item.includes("BACKEND_ORIGIN")));
});

test("requires Twilio credentials only when SMS is enabled", () => {
  const result = checkProductionReadiness({ ...validEnv, ENABLE_SMS_NOTIFICATIONS: "true" });
  assert.equal(result.ready, false);
  assert(result.blockers.some((item) => item.includes("TWILIO_ACCOUNT_SID")));
});

test("requires production monitoring and matching storefront origins", () => {
  const result = checkProductionReadiness({
    ...validEnv,
    FRONTEND_URL: "https://checkout.phonesine.com",
    OPERATIONS_ALERT_WEBHOOK_URL: "",
    ERROR_TRACKING_WEBHOOK_URL: "replace-error-tracking",
  });
  assert.equal(result.ready, false);
  assert(result.blockers.some((item) => item.includes("FRONTEND_ORIGIN and FRONTEND_URL")));
  assert(result.blockers.some((item) => item.includes("OPERATIONS_ALERT_WEBHOOK_URL")));
  assert(result.blockers.some((item) => item.includes("ERROR_TRACKING_WEBHOOK_URL")));
});
