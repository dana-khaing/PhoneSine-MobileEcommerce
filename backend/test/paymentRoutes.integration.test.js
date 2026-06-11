const test = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../src/app");
const db = require("../models");
const { settleReservations } = require("../src/inventoryService");

test.after(async () => {
  await db.sequelize.close();
});

test("serves inventory and produces an end-to-end checkout quote", async () => {
  const server = createApp().listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    const productsResponse = await fetch(`${baseUrl}/products`);
    assert.equal(productsResponse.status, 200);
    const products = await productsResponse.json();
    assert.ok(products.length > 0);
    assert.ok(products[0].availableStock >= 0);

    const quoteResponse = await fetch(`${baseUrl}/payments/quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ id: products[0].id, quantity: 1 }],
        checkout: {
          email: "buyer@example.com",
          firstName: "Dana",
          lastName: "Khaing",
          address: "1 High Street",
          city: "London",
          postcode: "SW1A 1AA",
          country: "GB",
          deliveryMethod: "standard",
          promotionCode: "WELCOME10",
        },
      }),
    });
    assert.equal(quoteResponse.status, 200);
    const quote = await quoteResponse.json();
    assert.equal(quote.taxRate, 20);
    assert.ok(quote.discountAmount > 0);
    assert.ok(quote.totalAmount > 0);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("creates checkout orders and reserves stock through the payment route", async () => {
  const originalFetch = global.fetch;
  const originalStripeKey = process.env.STRIPE_SECRET_KEY;
  process.env.STRIPE_SECRET_KEY = "sk_test_integration";
  global.fetch = async (url, options) => {
    if (String(url).startsWith("https://api.stripe.com/")) {
      return new Response(
        JSON.stringify({ id: "cs_test_integration", url: "https://checkout.stripe.test" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    return originalFetch(url, options);
  };

  const server = createApp().listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  let order;
  try {
    const response = await originalFetch(`${baseUrl}/payments/create-checkout-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ id: 1, quantity: 1 }],
        checkout: {
          email: "integration@example.com",
          firstName: "Integration",
          lastName: "Buyer",
          address: "1 High Street",
          city: "London",
          postcode: "SW1A 1AA",
          country: "GB",
          deliveryMethod: "standard",
          promotionCode: "",
        },
      }),
    });
    assert.equal(response.status, 200);
    order = await db.Order.findOne({ where: { email: "integration@example.com" } });
    assert.equal(order.status, "pending");
    assert.equal(order.stripeSessionId, "cs_test_integration");
    assert.ok(order.taxAmount > 0);
    assert.equal(
      await db.InventoryReservation.count({
        where: { orderId: order.id, status: "reserved" },
      }),
      1
    );
  } finally {
    if (order) {
      await db.sequelize.transaction(async (transaction) => {
        await settleReservations(order.id, "release", transaction);
        await order.destroy({ transaction });
      });
    }
    global.fetch = originalFetch;
    process.env.STRIPE_SECRET_KEY = originalStripeKey;
    await new Promise((resolve) => server.close(resolve));
  }
});
