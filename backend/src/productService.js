const { Category, Product, ProductVariant } = require("../models");

function objectValue(value, field) {
  if (value == null || value === "") return {};
  const parsed = typeof value === "string" ? JSON.parse(value) : value;
  if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
    throw new Error(`${field} must be an object`);
  }
  return parsed;
}

function productFields(input, existing = {}) {
  const name = String(input.name ?? existing.name ?? "").trim();
  const brand = String(input.brand ?? existing.brand ?? "").trim();
  const description = String(input.description ?? existing.description ?? "").trim();
  const priceAmount = Number(input.priceAmount ?? existing.priceAmount);
  const stockQuantity = Number(input.stockQuantity ?? existing.stockQuantity ?? 0);
  const categoryId = input.categoryId === "" ? null : (input.categoryId ?? existing.categoryId ?? null);
  const specifications = objectValue(input.specifications ?? existing.specifications, "Specifications");

  if (!name || !brand) throw new Error("Product name and brand are required");
  if (!Number.isInteger(priceAmount) || priceAmount < 1) {
    throw new Error("Product price must be a positive integer");
  }
  if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
    throw new Error("Stock quantity must be a non-negative integer");
  }
  return { name, brand, description, priceAmount, stockQuantity, categoryId, specifications };
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

async function createCategory(input) {
  const name = String(input.name || "").trim();
  const slug = String(input.slug || name).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!name || !slug) throw new Error("Category name is required");
  return Category.create({ name, slug });
}

function variantFields(input, existing = {}) {
  const sku = String(input.sku ?? existing.sku ?? "").trim().toUpperCase();
  const name = String(input.name ?? existing.name ?? "").trim();
  const priceAmount = Number(input.priceAmount ?? existing.priceAmount);
  const stockQuantity = Number(input.stockQuantity ?? existing.stockQuantity ?? 0);
  const options = objectValue(input.options ?? existing.options, "Variant options");
  if (!sku || !name) throw new Error("Variant SKU and name are required");
  if (!Number.isInteger(priceAmount) || priceAmount < 1) throw new Error("Variant price must be a positive integer");
  if (!Number.isInteger(stockQuantity) || stockQuantity < 0) throw new Error("Variant stock must be a non-negative integer");
  return { sku, name, priceAmount, stockQuantity, options };
}

async function createVariant(productId, input) {
  return ProductVariant.create({ productId, ...variantFields(input), active: input.active !== false });
}

async function updateVariant(variant, input) {
  return variant.update({ ...variantFields(input, variant), active: input.active ?? variant.active });
}

module.exports = { createCategory, createProduct, createVariant, productFields, updateProduct, updateVariant, variantFields };
