require("dotenv").config();
const db = require("../models");
const { cleanupAbandonedOrders } = require("./orderOperations");
const { deliverPendingNotifications } = require("./notificationService");
const { runMaintenance } = require("./maintenanceService");
const { queueLowStockAlerts } = require("./operationsService");
const { reconcilePayments } = require("./reconciliationService");

const jobs = {
  cleanup: async () => ({ cleaned: await cleanupAbandonedOrders() }),
  maintenance: runMaintenance,
  notifications: async () => ({ delivered: await deliverPendingNotifications() }),
  reconcile: async () => ({ results: await reconcilePayments() }),
  "low-stock": async () => ({ queued: await queueLowStockAlerts(process.env.OPERATIONS_ALERT_EMAIL) }),
};

async function main(name = process.argv[2]) {
  if (!jobs[name]) throw new Error(`Unknown job. Choose one of: ${Object.keys(jobs).join(", ")}`);
  await db.sequelize.authenticate();
  const result = await jobs[name]();
  console.log(JSON.stringify({ job: name, result }));
  await db.sequelize.close();
  return result;
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { jobs, main };
