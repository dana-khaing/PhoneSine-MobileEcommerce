const { checkProductionReadiness } = require("./productionReadiness");

const phases = [
  ["Pre-launch", [
    "Apply all database migrations and confirm `pnpm run db:migrate:status` shows every migration up.",
    "Run `pnpm run check:production` from `backend/` and resolve every blocker.",
    "Confirm backup storage, restore verification, and scheduled maintenance are enabled.",
  ]],
  ["Provider setup", [
    "Configure Stripe live keys and webhook events for checkout, refunds, disputes, and expirations.",
    "Configure email, SMS, shipping carrier, bot protection, operations alerts, and error tracking providers.",
    "Create initial admin users and verify database-backed roles before opening admin routes.",
  ]],
  ["Deploy", [
    "Deploy immutable backend and frontend images tagged with the same release identifier.",
    "Set production environment variables and keep secrets out of repository files.",
    "Run health, readiness, metrics, and payment health checks before routing customer traffic.",
  ]],
  ["Post-launch", [
    "Place a test order in Stripe test mode or a controlled live-mode transaction, then verify order, inventory, email, and webhook state.",
    "Check admin analytics, operations reports, low-stock alerts, and refund/return paths.",
    "Confirm alerts are received for synthetic failures and document the rollback commit/image tag.",
  ]],
];

function checkbox(done) {
  return done ? "[x]" : "[ ]";
}

function generateLaunchRunbook(env = process.env) {
  const readiness = checkProductionReadiness(env);
  const lines = [
    "# Phone Sine Launch Runbook",
    "",
    `Production readiness: ${readiness.ready ? "ready" : "blocked"}`,
    "",
  ];
  if (readiness.blockers.length) {
    lines.push("## Readiness Blockers", "");
    for (const blocker of readiness.blockers) lines.push(`- ${blocker}`);
    lines.push("");
  }
  if (readiness.warnings.length) {
    lines.push("## Readiness Warnings", "");
    for (const warning of readiness.warnings) lines.push(`- ${warning}`);
    lines.push("");
  }
  for (const [phase, tasks] of phases) {
    lines.push(`## ${phase}`, "");
    for (const task of tasks) lines.push(`- ${checkbox(false)} ${task}`);
    lines.push("");
  }
  return `${lines.join("\n").trim()}\n`;
}

module.exports = { generateLaunchRunbook };
