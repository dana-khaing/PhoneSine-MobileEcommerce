const VAT_RATES = {
  GB: 20,
  IE: 23,
  DE: 19,
  FR: 20,
  US: 0,
  CA: 0,
  AU: 10,
};

function validateAddress(address) {
  const fields = ["address", "city", "postcode", "country"];
  if (fields.some((field) => !address?.[field]?.trim())) {
    throw new Error("Complete international shipping address is required");
  }
  const country = address.country.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(country)) {
    throw new Error("Country must be a two-letter ISO code");
  }
  if (address.postcode.trim().length < 3) {
    throw new Error("Postcode is invalid");
  }
  return { ...address, country };
}

function calculateAmounts(items, { country, deliveryAmount = 0, percentOff = 0, giftCardAmount = 0 }) {
  const subtotalAmount = items.reduce(
    (total, item) => total + item.unitAmount * item.quantity,
    0
  );
  const discountAmount = Math.round(subtotalAmount * (percentOff / 100));
  const taxableAmount = subtotalAmount - discountAmount;
  const taxRate = VAT_RATES[country] ?? 0;
  const taxAmount = Math.round(taxableAmount * (taxRate / 100));

  return {
    subtotalAmount,
    discountAmount,
    taxAmount,
    deliveryAmount,
    giftCardAmount: Math.min(giftCardAmount, taxableAmount + taxAmount + deliveryAmount),
    totalAmount: Math.max(0, taxableAmount + taxAmount + deliveryAmount - giftCardAmount),
    taxRate,
  };
}

function validatePromotion(promotion, now = new Date()) {
  if (!promotion || !promotion.active) throw new Error("Promotion code is invalid");
  if (promotion.expiresAt && new Date(promotion.expiresAt) <= now) {
    throw new Error("Promotion code has expired");
  }
  if (promotion.percentOff < 1 || promotion.percentOff > 100) {
    throw new Error("Promotion discount is invalid");
  }
  if (promotion.maxUses != null && promotion.useCount >= promotion.maxUses) {
    throw new Error("Promotion usage limit reached");
  }
  return promotion.percentOff;
}

function nextFulfillmentStatus(currentStatus, requestedStatus) {
  const allowed = {
    paid: ["processing", "refund_pending"],
    processing: ["shipped", "refund_pending"],
    shipped: ["delivered", "refund_pending"],
    delivered: ["refund_pending"],
  };
  if (!allowed[currentStatus]?.includes(requestedStatus)) {
    throw new Error(`Cannot move order from ${currentStatus} to ${requestedStatus}`);
  }
  return requestedStatus;
}

module.exports = {
  calculateAmounts,
  nextFulfillmentStatus,
  validateAddress,
  validatePromotion,
};
