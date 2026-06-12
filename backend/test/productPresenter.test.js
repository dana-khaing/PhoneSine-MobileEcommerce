const test = require("node:test");
const assert = require("node:assert/strict");
const { presentProduct } = require("../src/productPresenter");

test("presents product prices and available stock for storefront APIs", () => {
  assert.deepEqual(
    presentProduct({
      id: 1,
      name: "Phone",
      priceAmount: 99900,
      stockQuantity: 10,
      reservedQuantity: 3,
    }),
    {
      id: 1,
      name: "Phone",
      priceAmount: 99900,
      priceInPence: 99900,
      price: 999,
      stockQuantity: 10,
      reservedQuantity: 3,
      availableStock: 7,
    }
  );
});

test("presents prices from aliased list-query fields", () => {
  assert.equal(presentProduct({
    priceInPence: 50000,
    stockQuantity: 1,
    reservedQuantity: 0,
  }).price, 500);
});
