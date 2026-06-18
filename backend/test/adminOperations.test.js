const test = require("node:test");
const assert = require("node:assert/strict");
const { operationsSummaryToCsv, trendPercent } = require("../src/operationsService");

test("admin operations CSV exports summary metrics", () => {
  assert.equal(
    operationsSummaryToCsv({
      orders: 3,
      revenue: 12000,
      lowStock: [{ id: 1 }],
      dashboard: {
        funnel: { conversionRate: 67, productViews: 22 },
        stock: { available: 14 },
      },
    }),
    "metric,value\norders,3\npaid_revenue,12000\nlow_stock_items,1\nconversion_rate,67\nproduct_views,22\navailable_stock,14"
  );
});

test("admin analytics trend handles empty previous period", () => {
  assert.equal(trendPercent(0, 0), 0);
  assert.equal(trendPercent(5000, 0), 100);
  assert.equal(trendPercent(15000, 10000), 50);
  assert.equal(trendPercent(5000, 10000), -50);
});
