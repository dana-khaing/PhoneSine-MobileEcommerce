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

module.exports = { createCheckoutSession, retrieveCheckoutSession };
