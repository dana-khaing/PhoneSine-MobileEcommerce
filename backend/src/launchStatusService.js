const { checkProductionReadiness } = require("./productionReadiness");

const checklist = [
  { id: "readiness", label: "Production readiness blockers resolved", requiresReady: true },
  { id: "database", label: "Database migrations are applied" },
  { id: "backups", label: "Backups and restore verification are configured" },
  { id: "stripe", label: "Stripe live keys and webhooks are configured" },
  { id: "providers", label: "Email, SMS, shipping, bot protection, alerts, and error tracking providers are configured" },
  { id: "admins", label: "Initial admin users and roles are verified" },
  { id: "health", label: "Health, readiness, metrics, and payment checks are monitored" },
  { id: "order-test", label: "Controlled end-to-end order test is completed" },
];

const providerGroups = [
  { id: "stripe", label: "Stripe", keys: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"] },
  { id: "email", label: "Email", keys: ["EMAIL_WEBHOOK_URL"] },
  { id: "sms", label: "SMS", keys: ["ENABLE_SMS_NOTIFICATIONS", "TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_FROM_NUMBER"] },
  { id: "shipping", label: "Shipping carrier", keys: ["CARRIER_API_URL", "CARRIER_API_KEY", "SHIPPING_WEBHOOK_SECRET"] },
  { id: "protection", label: "Bot protection", keys: ["TURNSTILE_SECRET_KEY"] },
  { id: "alerts", label: "Alerts and tracking", keys: ["METRICS_TOKEN", "OPERATIONS_ALERT_WEBHOOK_URL", "ERROR_TRACKING_WEBHOOK_URL"] },
  { id: "analytics", label: "Storefront analytics", keys: ["NEXT_PUBLIC_ANALYTICS_DOMAIN", "NEXT_PUBLIC_ANALYTICS_SCRIPT_URL"] },
];

function configured(env, key) {
  const value = env[key];
  return typeof value === "string" && value.trim().length > 0 && !/replace|example|localhost|your-|test-only/i.test(value);
}

function providerStatuses(env) {
  return providerGroups.map((group) => {
    const configuredKeys = group.keys.filter((key) => configured(env, key));
    return {
      id: group.id,
      label: group.label,
      configured: configuredKeys.length,
      total: group.keys.length,
      ready: configuredKeys.length === group.keys.length,
    };
  });
}

function launchStatus(env = process.env) {
  const readiness = checkProductionReadiness(env);
  const providers = providerStatuses(env);
  const completedChecklist = checklist.filter((item) => item.requiresReady ? readiness.ready : false).length;
  return {
    ready: readiness.ready,
    blockers: readiness.blockers,
    warnings: readiness.warnings,
    checklist: {
      completed: completedChecklist,
      total: checklist.length,
      items: checklist.map((item) => ({
        ...item,
        done: item.requiresReady ? readiness.ready : false,
      })),
    },
    providers,
  };
}

module.exports = { launchStatus, providerStatuses };
