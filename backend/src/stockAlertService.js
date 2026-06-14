const { Product, ProductVariant, StockAlert } = require("../models");
const { sendEmail } = require("./providerService");

async function sendStockAlert(message) {
  if (process.env.RESEND_API_KEY) return sendEmail(message);
  if (process.env.EMAIL_WEBHOOK_URL) {
    const response = await fetch(process.env.EMAIL_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
    if (!response.ok) throw new Error("Email provider rejected stock alert");
    return;
  }
  console.log(`[email:${message.to}] ${message.subject}`);
}

function normalizeSubscription(input) {
  const email = String(input.email || "").trim().toLowerCase();
  const productId = Number(input.productId);
  const variantId = input.variantId ? Number(input.variantId) : null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Valid email required");
  if (!Number.isInteger(productId) || productId < 1) throw new Error("Valid product required");
  if (variantId !== null && (!Number.isInteger(variantId) || variantId < 1)) throw new Error("Valid variant required");
  return { email, productId, variantId };
}

async function subscribeToStock(input) {
  const values = normalizeSubscription(input);
  const product = await Product.findOne({ where: { id: values.productId, active: true } });
  if (!product) throw new Error("Product not found");
  if (values.variantId) {
    const variant = await ProductVariant.findOne({ where: { id: values.variantId, productId: product.id, active: true } });
    if (!variant) throw new Error("Variant not found");
  }
  const [alert] = await StockAlert.findOrCreate({ where: { ...values, status: "pending" }, defaults: values });
  return alert;
}

async function deliverStockAlerts(limit = 50) {
  const alerts = await StockAlert.findAll({
    where: { status: "pending" },
    include: ["product", "variant"],
    limit,
    order: [["createdAt", "ASC"]],
  });
  let delivered = 0;
  for (const alert of alerts) {
    const item = alert.variant || alert.product;
    if (!alert.product?.active || !item?.active || item.stockQuantity - item.reservedQuantity < 1) continue;
    await sendStockAlert({
      to: alert.email,
      subject: `${alert.product.name} is back in stock`,
      text: `${alert.variant?.name || alert.product.name} is available again. Visit the Phone Sine store to order.`,
    });
    await alert.update({ status: "sent", notifiedAt: new Date() });
    delivered += 1;
  }
  return delivered;
}

module.exports = { deliverStockAlerts, normalizeSubscription, subscribeToStock };
