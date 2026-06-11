const test = require("node:test");
const assert = require("node:assert/strict");
const {
  calculateAmounts,
  nextFulfillmentStatus,
  validateAddress,
  validatePromotion,
} = require("../src/commerceService");

test("calculates discounts, VAT, delivery, and final totals", () => {
  assert.deepEqual(
    calculateAmounts([{ unitAmount: 10000, quantity: 1 }], {
      country: "GB",
      deliveryAmount: 1250,
      percentOff: 10,
    }),
    {
      subtotalAmount: 10000,
      discountAmount: 1000,
      taxAmount: 1800,
      deliveryAmount: 1250,
      totalAmount: 12050,
      taxRate: 20,
    }
  );
});

test("validates international addresses and promotions", () => {
  assert.equal(
    validateAddress({
      address: "1 High Street",
      city: "London",
      postcode: "SW1A 1AA",
      country: "gb",
    }).country,
    "GB"
  );
  assert.throws(() => validateAddress({ country: "United Kingdom" }), /Complete/);
  assert.equal(validatePromotion({ active: true, percentOff: 10 }), 10);
  assert.throws(
    () => validatePromotion({ active: true, percentOff: 10, maxUses: 2, useCount: 2 }),
    /usage limit/
  );
  assert.throws(
    () => validatePromotion({ active: true, percentOff: 10, expiresAt: "2020-01-01" }),
    /expired/
  );
});

test("enforces fulfillment transition order", () => {
  assert.equal(nextFulfillmentStatus("paid", "processing"), "processing");
  assert.equal(nextFulfillmentStatus("processing", "shipped"), "shipped");
  assert.throws(() => nextFulfillmentStatus("paid", "delivered"), /Cannot move/);
});
