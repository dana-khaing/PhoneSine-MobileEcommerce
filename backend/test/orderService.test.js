const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("crypto");
const { calculateOrderTotal, verifyStripeSignature } = require("../src/orderService");

test("calculates server-side order totals including delivery", () => {
  const items = [{ unitAmount: 10000, quantity: 2 }];
  assert.equal(calculateOrderTotal(items, "standard"), 20000);
  assert.equal(calculateOrderTotal(items, "express"), 21250);
});

test("verifies Stripe webhook signatures and rejects stale signatures", () => {
  const secret = "whsec_test";
  const rawBody = '{"type":"checkout.session.completed"}';
  const timestamp = 1700000000;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");
  const header = `t=${timestamp},v1=${signature}`;

  assert.equal(verifyStripeSignature(rawBody, header, secret, timestamp * 1000), true);
  assert.equal(verifyStripeSignature(rawBody, header, secret, (timestamp + 301) * 1000), false);
  assert.equal(verifyStripeSignature(rawBody, "invalid", secret, timestamp * 1000), false);
});
