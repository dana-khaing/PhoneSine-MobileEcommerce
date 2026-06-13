const test = require("node:test");
const assert = require("node:assert/strict");
const { operationsSummaryToCsv } = require("../src/operationsService");

test("admin operations CSV exports summary metrics", () => {
  assert.equal(
    operationsSummaryToCsv({ orders: 3, revenue: 12000, lowStock: [{ id: 1 }] }),
    "metric,value\norders,3\npaid_revenue,12000\nlow_stock_items,1"
  );
});
