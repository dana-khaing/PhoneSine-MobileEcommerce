const express = require("express");
const {
  buildCheckoutItems,
  createStripeCheckoutBody,
} = require("./paymentService");

const router = express.Router();

router.post("/create-checkout-session", async (req, res) => {
  const { items, checkout } = req.body;

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).send("Stripe is not configured");
  }
  if (!Array.isArray(items) || items.length === 0 || !checkout?.email) {
    return res.status(400).send("Cart and checkout details are required");
  }

  try {
    const checkoutItems = buildCheckoutItems(items);
    const body = createStripeCheckoutBody(
      checkoutItems,
      checkout,
      process.env.FRONTEND_URL || "http://localhost:3000"
    );
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
      return res.status(502).send(session.error?.message || "Unable to create payment session");
    }

    return res.json({ url: session.url });
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

module.exports = router;
