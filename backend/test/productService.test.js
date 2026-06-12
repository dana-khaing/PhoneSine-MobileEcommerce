const test = require("node:test");
const assert = require("node:assert/strict");
const models = require("../models");
const { createCategory, createProduct, productFields, updateProduct, variantFields } = require("../src/productService");

test("validates product management fields", () => {
  assert.deepEqual(productFields({
    name: "Phone",
    brand: "Phone Sine",
    description: "Flagship",
    priceAmount: 99900,
    stockQuantity: 8,
    categoryId: null,
    specifications: {},
    allowBackorder: false,
    preorderDate: null,
  }), {
    name: "Phone",
    brand: "Phone Sine",
    description: "Flagship",
    priceAmount: 99900,
    stockQuantity: 8,
    categoryId: null,
    specifications: {},
    allowBackorder: false,
    preorderDate: null,
  });
  assert.throws(() => productFields({ name: "", brand: "Brand", priceAmount: 1 }), /required/);
  assert.throws(() => productFields({ name: "Phone", brand: "Brand", priceAmount: 0 }), /positive/);
});

test("validates category and variant fields", async () => {
  const originalCreate = models.Category.create;
  models.Category.create = async (record) => record;
  try {
    assert.deepEqual(await createCategory({ name: "Smart Phones" }), { name: "Smart Phones", slug: "smart-phones" });
    assert.deepEqual(variantFields({ sku: " blue-256 ", name: "Blue 256GB", priceAmount: 120000, stockQuantity: 4, options: { color: "Blue" } }), {
      sku: "BLUE-256",
      name: "Blue 256GB",
      priceAmount: 120000,
      stockQuantity: 4,
      options: { color: "Blue" },
    });
  } finally {
    models.Category.create = originalCreate;
  }
});

test("creates and updates products through the product service", async () => {
  const originalCreate = models.Product.create;
  const created = [];
  models.Product.create = async (value) => {
    created.push(value);
    return value;
  };
  const product = {
    name: "Old",
    brand: "Brand",
    description: "",
    priceAmount: 100,
    stockQuantity: 1,
    active: true,
    update: async (value) => Object.assign(product, value),
  };
  try {
    await createProduct({ name: "New", brand: "Brand", priceAmount: 200, stockQuantity: 2 });
    await updateProduct(product, { name: "Updated", priceAmount: 300 });
    assert.equal(created[0].active, true);
    assert.equal(product.name, "Updated");
    assert.equal(product.priceAmount, 300);
  } finally {
    models.Product.create = originalCreate;
  }
});
