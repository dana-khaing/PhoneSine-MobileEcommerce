const test = require("node:test");
const assert = require("node:assert/strict");
const { createCheckoutSession, createRefund, detachPaymentMethod, listPaymentMethods } = require("../src/stripeApi");

test("sends Stripe idempotency keys for checkout and refunds", async () => {
  const originalFetch = global.fetch;
  const headers = [];
  global.fetch = async (_url, options) => {
    headers.push(options.headers);
    return new Response(JSON.stringify({ id: "stripe_object" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };
  try {
    await createCheckoutSession(new URLSearchParams(), "checkout-key");
    await createRefund("pi_test", 100, {}, "refund-key");
    assert.equal(headers[0]["Idempotency-Key"], "checkout-key");
    assert.equal(headers[1]["Idempotency-Key"], "refund-key");
  } finally {
    global.fetch = originalFetch;
  }
});

test("lists and detaches saved Stripe payment methods", async () => {
  const originalFetch = global.fetch;
  const requests = [];
  global.fetch = async (url, options = {}) => {
    requests.push({ url: String(url), method: options.method || "GET" });
    return new Response(JSON.stringify({ data: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };
  try {
    await listPaymentMethods("cus_test");
    await detachPaymentMethod("pm_test");
    assert.match(requests[0].url, /customer=cus_test/);
    assert.deepEqual(requests.map((request) => request.method), ["GET", "POST"]);
  } finally {
    global.fetch = originalFetch;
  }
});
