const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeSubscription } = require("../src/stockAlertService");

test("normalizes back-in-stock subscriptions", () => {
  assert.deepEqual(normalizeSubscription({ email: " Dana@Example.COM ", productId: "4", variantId: "8" }), {
    email: "dana@example.com", productId: 4, variantId: 8,
  });
});

test("rejects invalid back-in-stock subscriptions", () => {
  assert.throws(() => normalizeSubscription({ email: "invalid", productId: 1 }), /email/);
  assert.throws(() => normalizeSubscription({ email: "a@example.com", productId: 0 }), /product/);
});
