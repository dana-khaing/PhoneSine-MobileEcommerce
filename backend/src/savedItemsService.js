const { Product, ProductVariant } = require("../models");

async function validateSavedItems(items) {
  if (!Array.isArray(items) || items.length > 100) throw new Error("Cart items must be an array of at most 100 items");
  for (const item of items) {
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) throw new Error("Invalid cart quantity");
    if (!await Product.findOne({ where: { id: item.id, active: true } })) throw new Error(`Unknown product: ${item.id}`);
    if (item.variantId && !await ProductVariant.findOne({ where: { id: item.variantId, productId: item.id, active: true } })) {
      throw new Error(`Unknown product variant: ${item.variantId}`);
    }
  }
  return items.map(({ id, variantId, quantity }) => ({ id, variantId: variantId || null, quantity }));
}

module.exports = { validateSavedItems };
