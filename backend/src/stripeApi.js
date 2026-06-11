const STRIPE_API_URL = "https://api.stripe.com/v1";
const STRIPE_VERSION = "2026-02-25.clover";

function stripeHeaders(contentType) {
  return {
    Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
    ...(contentType ? { "Content-Type": contentType } : {}),
    "Stripe-Version": STRIPE_VERSION,
  };
}

async function createCheckoutSession(body) {
  const response = await fetch(`${STRIPE_API_URL}/checkout/sessions`, {
    method: "POST",
    headers: stripeHeaders("application/x-www-form-urlencoded"),
    body,
  });
  const session = await response.json();

  if (!response.ok) {
    throw new Error(session.error?.message || "Unable to create payment session");
  }

  return session;
}

async function retrieveCheckoutSession(sessionId) {
  if (!/^cs_[a-zA-Z0-9_]+$/.test(sessionId)) {
    throw new Error("Invalid checkout session");
  }

  const response = await fetch(
    `${STRIPE_API_URL}/checkout/sessions/${encodeURIComponent(sessionId)}`,
    { headers: stripeHeaders() }
  );
  const session = await response.json();

  if (!response.ok) {
    throw new Error(session.error?.message || "Unable to verify payment session");
  }

  return session;
}

async function createRefund(paymentIntentId, amount, metadata = {}) {
  const body = new URLSearchParams({
    payment_intent: paymentIntentId,
    ...(amount ? { amount: String(amount) } : {}),
  });
  Object.entries(metadata).forEach(([key, value]) =>
    body.set(`metadata[${key}]`, String(value))
  );
  const response = await fetch(`${STRIPE_API_URL}/refunds`, {
    method: "POST",
    headers: stripeHeaders("application/x-www-form-urlencoded"),
    body,
  });
  const refund = await response.json();
  if (!response.ok) throw new Error(refund.error?.message || "Unable to create refund");
  return refund;
}

async function expireCheckoutSession(sessionId) {
  const response = await fetch(
    `${STRIPE_API_URL}/checkout/sessions/${encodeURIComponent(sessionId)}/expire`,
    { method: "POST", headers: stripeHeaders("application/x-www-form-urlencoded") }
  );
  const session = await response.json();
  if (!response.ok) throw new Error(session.error?.message || "Unable to cancel checkout");
  return session;
}

module.exports = {
  createCheckoutSession,
  createRefund,
  expireCheckoutSession,
  retrieveCheckoutSession,
};
