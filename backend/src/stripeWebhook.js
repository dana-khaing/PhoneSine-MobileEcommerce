const { verifyStripeSignature } = require("./orderService");
const { processStripeEvent } = require("./webhookRepository");

async function stripeWebhook(req, res) {
  const signature = req.headers["stripe-signature"];
  const rawBody = req.body.toString("utf8");

  if (
    !process.env.STRIPE_WEBHOOK_SECRET ||
    !signature ||
    !verifyStripeSignature(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET)
  ) {
    return res.status(400).send("Invalid Stripe signature");
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return res.status(400).send("Invalid webhook payload");
  }
  if (!event.id || !event.type) {
    return res.status(400).send("Invalid Stripe event");
  }

  try {
    const result = await processStripeEvent(event);
    return res.json({ received: true, duplicate: result.duplicate });
  } catch (error) {
    console.error("Stripe webhook processing failed:", event.id, error.message);
    return res.status(500).send("Webhook processing failed");
  }
}

module.exports = { stripeWebhook };
