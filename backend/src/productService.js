const { Product } = require("../models");

function productFields(input, existing = {}) {
  const name = String(input.name ?? existing.name ?? "").trim();
  const brand = String(input.brand ?? existing.brand ?? "").trim();
  const description = String(input.description ?? existing.description ?? "").trim();
  const priceAmount = Number(input.priceAmount ?? existing.priceAmount);
  const stockQuantity = Number(input.stockQuantity ?? existing.stockQuantity ?? 0);

  if (!name || !brand) throw new Error("Product name and brand are required");
  if (!Number.isInteger(priceAmount) || priceAmount < 1) {
    throw new Error("Product price must be a positive integer");
  }
  if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
    throw new Error("Stock quantity must be a non-negative integer");
  }
  return { name, brand, description, priceAmount, stockQuantity };
}

async function createProduct(input) {
  return Product.create({ ...productFields(input), active: input.active !== false });
}

async function updateProduct(product, input) {
  return product.update({
    ...productFields(input, product),
    active: input.active ?? product.active,
  });
}

module.exports = { createProduct, productFields, updateProduct };
