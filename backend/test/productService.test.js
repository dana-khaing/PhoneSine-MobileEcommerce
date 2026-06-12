const test = require("node:test");
const assert = require("node:assert/strict");
const models = require("../models");
const { createProduct, productFields, updateProduct } = require("../src/productService");

test("validates product management fields", () => {
  assert.deepEqual(productFields({
    name: "Phone",
    brand: "Phone Sine",
    description: "Flagship",
    priceAmount: 99900,
    stockQuantity: 8,
  }), {
    name: "Phone",
    brand: "Phone Sine",
    description: "Flagship",
    priceAmount: 99900,
    stockQuantity: 8,
  });
  assert.throws(() => productFields({ name: "", brand: "Brand", priceAmount: 1 }), /required/);
  assert.throws(() => productFields({ name: "Phone", brand: "Brand", priceAmount: 0 }), /positive/);
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
