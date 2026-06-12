const test = require("node:test");
const assert = require("node:assert/strict");
const models = require("../models");
const { validateSavedItems } = require("../src/savedItemsService");

test("validates and minimizes saved cart items", async () => {
  const originalProduct = models.Product.findOne;
  const originalVariant = models.ProductVariant.findOne;
  models.Product.findOne = async () => ({ id: 1 });
  models.ProductVariant.findOne = async () => ({ id: 2 });
  try {
    assert.deepEqual(await validateSavedItems([{ id: 1, variantId: 2, quantity: 3, price: 999 }]), [
      { id: 1, variantId: 2, quantity: 3 },
    ]);
    await assert.rejects(validateSavedItems([{ id: 1, quantity: 11 }]), /Invalid cart quantity/);
  } finally {
    models.Product.findOne = originalProduct;
    models.ProductVariant.findOne = originalVariant;
  }
});
