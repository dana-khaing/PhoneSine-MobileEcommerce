const { cleanupAbandonedOrders } = require("./orderOperations");
const { deliverPendingNotifications } = require("./notificationService");
const { reconcilePayments } = require("./reconciliationService");
const { log } = require("./logger");
const { deliverStockAlerts } = require("./stockAlertService");

async function runMaintenance(tasks = {}) {
  const cleanup = tasks.cleanup || cleanupAbandonedOrders;
  const notifications = tasks.notifications || deliverPendingNotifications;
  const reconcile = tasks.reconcile || reconcilePayments;
  const stockAlerts = tasks.stockAlerts || deliverStockAlerts;
  const startedAt = Date.now();
  const result = {
    cleaned: await cleanup(),
    delivered: await notifications(),
    reconciled: (await reconcile()).length,
    stockAlertsDelivered: await stockAlerts(),
  };
  log("info", "maintenance_completed", { ...result, durationMs: Date.now() - startedAt });
  return result;
}

module.exports = { runMaintenance };
