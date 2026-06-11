const test = require("node:test");
const assert = require("node:assert/strict");
const {
  buildCheckoutItems,
  createStripeCheckoutBody,
  validateCheckout,
} = require("../src/paymentService");

test("rebuilds checkout prices from the server catalogue", () => {
  const items = buildCheckoutItems([{ id: 1, price: 1, quantity: 2 }]);
  assert.deepEqual(items, [
    { productId: 1, name: "IPHONE 14 PRO", unitAmount: 99999, quantity: 2 },
  ]);
});

test("validates complete checkout details before creating payments", () => {
  const checkout = {
    email: "buyer@example.com",
    firstName: "Dana",
    lastName: "Khaing",
    address: "1 High Street",
    city: "London",
    postcode: "SW1A 1AA",
    deliveryMethod: "standard",
  };

  assert.doesNotThrow(() => validateCheckout(checkout));
  assert.throws(() => validateCheckout({ ...checkout, address: "" }), /Complete checkout/);
  assert.throws(() => validateCheckout({ ...checkout, email: "invalid" }), /valid checkout email/);
});

test("rejects unknown products and invalid quantities", () => {
  assert.throws(() => buildCheckoutItems([{ id: 999, quantity: 1 }]), /Unknown product/);
  assert.throws(() => buildCheckoutItems([{ id: 1, quantity: 0 }]), /Invalid quantity/);
});

test("creates Stripe Checkout Session parameters", () => {
  const body = createStripeCheckoutBody(
    [{ name: "Phone", unitAmount: 10000, quantity: 1 }],
    { email: "buyer@example.com", deliveryMethod: "standard" },
    "http://localhost:3000"
  );

  assert.equal(body.get("mode"), "payment");
  assert.equal(body.get("line_items[0][price_data][unit_amount]"), "10000");
  assert.equal(body.get("customer_email"), "buyer@example.com");
});

test("adds express delivery to Stripe Checkout and rejects unknown methods", () => {
  const body = createStripeCheckoutBody(
    [{ name: "Phone", unitAmount: 10000, quantity: 1 }],
    { email: "buyer@example.com", deliveryMethod: "express" },
    "http://localhost:3000"
  );

  assert.equal(body.get("line_items[1][price_data][unit_amount]"), "1250");
  assert.throws(
    () =>
      createStripeCheckoutBody(
        [{ name: "Phone", unitAmount: 10000, quantity: 1 }],
        { email: "buyer@example.com", deliveryMethod: "overnight" },
        "http://localhost:3000"
      ),
    /Invalid delivery method/
  );
});
