const test = require("node:test");
const assert = require("node:assert/strict");
const models = require("../models");

test("product images associate with their product gallery", () => {
  assert.ok(models.Product.associations.images);
  assert.equal(models.Product.associations.images.as, "images");
  assert.equal(models.ProductImage.rawAttributes.position.defaultValue, 0);
});
