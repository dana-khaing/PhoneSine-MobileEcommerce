const test = require("node:test");
const assert = require("node:assert/strict");
const { convertAmounts, normalizeCurrency } = require("../src/currencyService");

test("normalizes supported currencies and rejects unsupported currencies", () => {
  assert.equal(normalizeCurrency("USD"), "usd");
  assert.throws(() => normalizeCurrency("jpy"), /Unsupported/);
});

test("converts every monetary amount using configured rates", () => {
  const original = process.env.CURRENCY_RATES_JSON;
  process.env.CURRENCY_RATES_JSON = JSON.stringify({ usd: 2 });
  try {
    assert.deepEqual(
      convertAmounts({ subtotalAmount: 100, taxAmount: 20, taxRate: 20 }, "usd"),
      { subtotalAmount: 200, taxAmount: 40, taxRate: 20, currency: "usd" }
    );
  } finally {
    process.env.CURRENCY_RATES_JSON = original;
  }
});
