const express = require("express");
const { createStripeCheckoutBody, validateCheckout } = require("./paymentService");
const { Order, Userdetail } = require("../models");
const { optionalAuth } = require("./authMiddleware");
const { createOrderWithItems, quoteOrder } = require("./orderRepository");
const { createCheckoutSession, retrieveCheckoutSession } = require("./stripeApi");
const { verifyPaidCheckoutSession } = require("./orderService");
const { failOrderAndReleaseInventory } = require("./orderOperations");

const router = express.Router();

router.post("/quote", async (req, res) => {
  try {
    validateCheckout(req.body.checkout);
    return res.json(
      await quoteOrder({
        checkout: req.body.checkout,
        cartItems: req.body.items,
      })
    );
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

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
    const created = await createOrderWithItems({
      checkout,
      cartItems: items,
      userId: req.user?.userId,
    });
    order = created.order;
    const checkoutItems = created.checkoutItems;
    const body = createStripeCheckoutBody(
      checkoutItems,
      checkout,
      process.env.FRONTEND_URL || "http://localhost:3000"
      ,
      order
    );
    body.set("metadata[order_id]", order.id);
    if (req.user?.userId) {
      const user = await Userdetail.findByPk(req.user.userId);
      if (user?.stripeCustomerId) {
        body.delete("customer_email");
        body.set("customer", user.stripeCustomerId);
      } else {
        body.set("customer_creation", "always");
      }
      body.set("payment_intent_data[setup_future_usage]", "off_session");
    }
    body.set("metadata[tax_amount]", order.taxAmount);
    body.set("metadata[discount_amount]", order.discountAmount);
    const session = await createCheckoutSession(body);

    await order.update({ stripeSessionId: session.id });
    return res.json({ url: session.url });
  } catch (error) {
    if (order) {
      await failOrderAndReleaseInventory(order);
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
    return res.json({
      verified,
      orderId: order.id,
      status: verified ? "payment_confirmed" : order.status,
    });
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

module.exports = router;
