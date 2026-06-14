const test = require("node:test");
const assert = require("node:assert/strict");
const { preferredCategories } = require("../src/recommendationService");

test("ranks recommendation categories by customer interest", () => {
  assert.deepEqual(preferredCategories([
    { viewCount: 1, product: { categoryId: 2 } },
    { viewCount: 4, product: { categoryId: 1 } },
    { viewCount: 2, product: { categoryId: 2 } },
  ]), [1, 2]);
});
