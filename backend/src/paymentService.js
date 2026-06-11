const products = require("../public/productsList.json");
const deliveryPrices = { standard: 0, express: 1250 };

function buildCheckoutItems(cartItems) {
  return cartItems.map((cartItem) => {
    const product = products.find((candidate) => candidate.id === cartItem.id);
    if (!product) {
      throw new Error(`Unknown product: ${cartItem.id}`);
    }

    const quantity = Number(cartItem.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      throw new Error(`Invalid quantity for product: ${cartItem.id}`);
    }

    return {
      productId: product.id,
      name: product.name,
      unitAmount: Math.round(product.price * 100),
      quantity,
    };
  });
}

function createStripeCheckoutBody(items, { email, deliveryMethod }, frontendUrl) {
  const body = new URLSearchParams({
    mode: "payment",
    success_url: `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${frontendUrl}/checkout/cancel`,
    customer_email: email,
    "metadata[delivery_method]": deliveryMethod,
    "metadata[order_id]": "",
  });

  items.forEach((item, index) => {
    body.set(`line_items[${index}][price_data][currency]`, "gbp");
    body.set(`line_items[${index}][price_data][product_data][name]`, item.name);
    body.set(`line_items[${index}][price_data][unit_amount]`, item.unitAmount);
    body.set(`line_items[${index}][quantity]`, item.quantity);
  });

  const deliveryAmount = deliveryPrices[deliveryMethod];
  if (deliveryAmount === undefined) {
    throw new Error("Invalid delivery method");
  }
  if (deliveryAmount > 0) {
    const index = items.length;
    body.set(`line_items[${index}][price_data][currency]`, "gbp");
    body.set(`line_items[${index}][price_data][product_data][name]`, "Express delivery");
    body.set(`line_items[${index}][price_data][unit_amount]`, deliveryAmount);
    body.set(`line_items[${index}][quantity]`, 1);
  }

  return body;
}

module.exports = { buildCheckoutItems, createStripeCheckoutBody };
