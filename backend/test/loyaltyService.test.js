const test = require("node:test");
const assert = require("node:assert/strict");
const { pointsForOrder } = require("../src/loyaltyService");

test("awards one loyalty point per whole pound", () => {
  assert.equal(pointsForOrder(12345), 123);
  assert.equal(pointsForOrder(99), 0);
  assert.equal(pointsForOrder(-100), 0);
});
