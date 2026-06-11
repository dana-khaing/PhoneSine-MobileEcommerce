const crypto = require("crypto");

const deliveryPrices = { standard: 0, express: 1250 };

function calculateOrderTotal(items, deliveryMethod) {
  const delivery = deliveryPrices[deliveryMethod];
  if (delivery === undefined) throw new Error("Invalid delivery method");
  return items.reduce((total, item) => total + item.unitAmount * item.quantity, delivery);
}

function verifyStripeSignature(rawBody, signatureHeader, secret, now = Date.now()) {
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => part.split("="))
  );
  const timestamp = Number(parts.t);
  if (!timestamp || Math.abs(now / 1000 - timestamp) > 300) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");
  const actual = Buffer.from(parts.v1 || "", "hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  return actual.length === expectedBuffer.length &&
    crypto.timingSafeEqual(actual, expectedBuffer);
}

module.exports = { calculateOrderTotal, verifyStripeSignature };
