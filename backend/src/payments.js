const express = require("express");
const {
  buildCheckoutItems,
  createStripeCheckoutBody,
  validateCheckout,
} = require("./paymentService");
const { calculateOrderTotal } = require("./orderService");
const { Order, OrderItem } = require("../models");

const router = express.Router();

router.post("/create-checkout-session", async (req, res) => {
  const { items, checkout } = req.body;
  let order;

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).send("Stripe is not configured");
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).send("Cart and checkout details are required");
  }

  try {
    validateCheckout(checkout);
    const checkoutItems = buildCheckoutItems(items);
    order = await Order.create({
      email: checkout.email,
      status: "pending",
      totalAmount: calculateOrderTotal(checkoutItems, checkout.deliveryMethod),
      deliveryMethod: checkout.deliveryMethod,
      shippingAddress: checkout,
    });
    await OrderItem.bulkCreate(
      checkoutItems.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        name: item.name,
        unitAmount: item.unitAmount,
        quantity: item.quantity,
      }))
    );
    const body = createStripeCheckoutBody(
      checkoutItems,
      checkout,
      process.env.FRONTEND_URL || "http://localhost:3000"
    );
    body.set("metadata[order_id]", order.id);
    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Stripe-Version": "2026-02-25.clover",
      },
      body,
    });
    const session = await response.json();

    if (!response.ok) {
      await order.destroy();
      return res.status(502).send(session.error?.message || "Unable to create payment session");
    }

    await order.update({ stripeSessionId: session.id });
    return res.json({ url: session.url });
  } catch (error) {
    if (order) {
      await order.update({ status: "failed" });
    }
    return res.status(400).send(error.message);
  }
});

module.exports = router;
