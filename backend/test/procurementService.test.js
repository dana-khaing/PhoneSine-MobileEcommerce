const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizePurchaseOrder } = require("../src/procurementService");

test("normalizes purchase orders and calculates total cost", () => {
  assert.deepEqual(normalizePurchaseOrder({ supplierId: "1", warehouseId: "2", items: [{ productId: "3", quantity: "4", unitCostAmount: "500" }] }), {
    supplierId: 1, warehouseId: 2, expectedAt: null, totalAmount: 2000, items: [{ productId: 3, quantity: 4, unitCostAmount: 500 }],
  });
});

test("rejects invalid purchase orders", () => {
  assert.throws(() => normalizePurchaseOrder({ supplierId: 1, warehouseId: 2, items: [] }), /item/);
});
