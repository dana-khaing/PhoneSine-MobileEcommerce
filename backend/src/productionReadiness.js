const PLACEHOLDER = /replace|example|localhost|your-|test-only/i;

const required = [
  ["NODE_ENV", "production"],
  ["BACKEND_ORIGIN", "public backend origin"],
  ["FRONTEND_ORIGIN", "public storefront origin"],
  ["FRONTEND_URL", "public storefront URL"],
  ["JWT_SECRET", "strong signing secret"],
  ["MFA_ENCRYPTION_KEY", "separate MFA encryption key"],
  ["METRICS_TOKEN", "monitoring token"],
  ["STRIPE_SECRET_KEY", "Stripe secret key"],
  ["STRIPE_WEBHOOK_SECRET", "Stripe webhook signing secret"],
  ["ADMIN_EMAILS", "initial admin allowlist for first migration"],
];

const optionalProviders = [
  ["EMAIL_WEBHOOK_URL", "email delivery provider"],
  ["OPERATIONS_ALERT_WEBHOOK_URL", "operations alert webhook"],
  ["ERROR_TRACKING_WEBHOOK_URL", "error tracking collector"],
  ["TURNSTILE_SECRET_KEY", "bot protection"],
];

function present(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasPlaceholder(value) {
  return present(value) && PLACEHOLDER.test(value);
}

function checkUrl(env, key, issues) {
  if (!present(env[key])) return;
  try {
    const parsed = new URL(env[key]);
    if (parsed.protocol !== "https:" && env.NODE_ENV === "production") {
      issues.blockers.push(`${key} must use https in production`);
    }
  } catch {
    issues.blockers.push(`${key} must be a valid URL`);
  }
}

function checkProductionReadiness(env = process.env) {
  const issues = { blockers: [], warnings: [] };
  for (const [key, label] of required) {
    if (!present(env[key])) issues.blockers.push(`${key} is required for ${label}`);
    else if (hasPlaceholder(env[key])) issues.blockers.push(`${key} still contains a placeholder value`);
  }
  checkUrl(env, "BACKEND_ORIGIN", issues);
  checkUrl(env, "FRONTEND_ORIGIN", issues);
  checkUrl(env, "FRONTEND_URL", issues);

  if (present(env.JWT_SECRET) && present(env.MFA_ENCRYPTION_KEY) && env.JWT_SECRET === env.MFA_ENCRYPTION_KEY) {
    issues.blockers.push("MFA_ENCRYPTION_KEY must differ from JWT_SECRET");
  }
  if (present(env.JWT_SECRET) && env.JWT_SECRET.length < 32) issues.blockers.push("JWT_SECRET must be at least 32 characters");
  if (present(env.MFA_ENCRYPTION_KEY) && env.MFA_ENCRYPTION_KEY.length < 32) issues.blockers.push("MFA_ENCRYPTION_KEY must be at least 32 characters");
  if (present(env.STRIPE_SECRET_KEY) && env.NODE_ENV === "production" && !env.STRIPE_SECRET_KEY.startsWith("sk_live_")) {
    issues.blockers.push("STRIPE_SECRET_KEY must be a live key in production");
  }
  if (env.ENABLE_SMS_NOTIFICATIONS === "true") {
    for (const key of ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_FROM_NUMBER"]) {
      if (!present(env[key]) || hasPlaceholder(env[key])) issues.blockers.push(`${key} is required when SMS notifications are enabled`);
    }
  }
  if (!present(env.DATABASE_URL) && !present(env.DB_PASSWORD)) {
    issues.blockers.push("DATABASE_URL or DB_PASSWORD is required");
  }
  for (const [key, label] of optionalProviders) {
    if (!present(env[key])) issues.warnings.push(`${key} is not configured; ${label} will be disabled`);
  }
  if (env.RUN_IN_PROCESS_JOBS !== "true") {
    issues.warnings.push("RUN_IN_PROCESS_JOBS is disabled; ensure scheduled maintenance runs elsewhere");
  }
  return { ready: issues.blockers.length === 0, ...issues };
}

module.exports = { checkProductionReadiness };
