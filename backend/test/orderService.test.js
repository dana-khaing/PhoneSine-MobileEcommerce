const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("crypto");
const {
  calculateOrderTotal,
  orderStatusForStripeEvent,
  verifyPaidCheckoutSession,
  verifyStripeSignature,
} = require("../src/orderService");

test("calculates server-side order totals including delivery", () => {
  const items = [{ unitAmount: 10000, quantity: 2 }];
  assert.equal(calculateOrderTotal(items, "standard"), 20000);
  assert.equal(calculateOrderTotal(items, "express"), 21250);
});

test("maps supported Stripe events to order statuses", () => {
  assert.equal(orderStatusForStripeEvent("checkout.session.completed"), "paid");
  assert.equal(orderStatusForStripeEvent("checkout.session.async_payment_succeeded"), "paid");
  assert.equal(orderStatusForStripeEvent("checkout.session.async_payment_failed"), "failed");
  assert.equal(orderStatusForStripeEvent("checkout.session.expired"), "cancelled");
  assert.equal(orderStatusForStripeEvent("payment_intent.created"), undefined);
});

test("verifies paid sessions against the stored order", () => {
  const order = { id: 42, stripeSessionId: "cs_test_123", totalAmount: 10000 };
  const session = {
    id: "cs_test_123",
    payment_status: "paid",
    status: "complete",
    amount_total: 10000,
    metadata: { order_id: "42" },
  };

  assert.equal(verifyPaidCheckoutSession(session, order), true);
  assert.equal(
    verifyPaidCheckoutSession({ ...session, amount_total: 9999 }, order),
    false
  );
  assert.equal(
    verifyPaidCheckoutSession({ ...session, payment_status: "unpaid" }, order),
    false
  );
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
