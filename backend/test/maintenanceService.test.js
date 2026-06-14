const test = require("node:test");
const assert = require("node:assert/strict");
const { runMaintenance } = require("../src/maintenanceService");

test("runs every maintenance task and reports results", async () => {
  const result = await runMaintenance({
    cleanup: async () => 3,
    notifications: async () => 4,
    reconcile: async () => [{ orderId: 1 }, { orderId: 2 }],
  });
  assert.deepEqual(result, { cleaned: 3, delivered: 4, reconciled: 2 });
});
