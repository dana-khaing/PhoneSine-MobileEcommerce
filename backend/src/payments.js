const express = require("express");
const {
  buildCheckoutItems,
  createStripeCheckoutBody,
  validateCheckout,
} = require("./paymentService");
const { Order } = require("../models");
const { optionalAuth } = require("./authMiddleware");
const { createOrderWithItems } = require("./orderRepository");
const { createCheckoutSession, retrieveCheckoutSession } = require("./stripeApi");
const { verifyPaidCheckoutSession } = require("./orderService");

const router = express.Router();

router.post("/create-checkout-session", optionalAuth, async (req, res) => {
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
    if (
      req.user &&
      checkout.email.toLowerCase() !== req.user.email.toLowerCase()
    ) {
      return res.status(400).send("Checkout email must match signed-in user");
    }
    const checkoutItems = buildCheckoutItems(items);
    order = await createOrderWithItems({
      checkout,
      checkoutItems,
      userId: req.user?.userId,
    });
    const body = createStripeCheckoutBody(
      checkoutItems,
      checkout,
      process.env.FRONTEND_URL || "http://localhost:3000"
    );
    body.set("metadata[order_id]", order.id);
    const session = await createCheckoutSession(body);

    await order.update({ stripeSessionId: session.id });
    return res.json({ url: session.url });
  } catch (error) {
    if (order) {
      await order.update({ status: "failed" });
    }
    return res.status(400).send(error.message);
  }
});

router.get("/checkout-session/:sessionId", async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).send("Stripe is not configured");
  }

  try {
    const session = await retrieveCheckoutSession(req.params.sessionId);
    const order = await Order.findOne({
      where: { stripeSessionId: session.id },
    });
    if (!order) return res.status(404).send("Order not found");

    const verified = verifyPaidCheckoutSession(session, order);
    if (verified && order.status !== "paid") {
      await order.update({ status: "paid" });
    }

    return res.json({
      verified,
      orderId: order.id,
      status: verified ? "paid" : order.status,
    });
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

module.exports = router;
