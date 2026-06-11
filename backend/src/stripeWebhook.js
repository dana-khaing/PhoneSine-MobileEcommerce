const { Order } = require("../models");
const { verifyStripeSignature } = require("./orderService");

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
  const session = event.data?.object;
  const statuses = {
    "checkout.session.completed": "paid",
    "checkout.session.expired": "cancelled",
  };

  if (statuses[event.type] && session?.id) {
    await Order.update(
      { status: statuses[event.type] },
      { where: { stripeSessionId: session.id } }
    );
  }

  return res.json({ received: true });
}

module.exports = { stripeWebhook };
