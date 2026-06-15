const test = require("node:test");
const assert = require("node:assert/strict");
const { editDistance, rankedMatches } = require("../src/searchService");

test("calculates search edit distance", () => {
  assert.equal(editDistance("iphone", "iphnoe"), 2);
  assert.equal(editDistance("pixel", "pixel"), 0);
});

test("ranks typo-tolerant product matches", () => {
  const products = [{ id: 1, name: "iPhone 15", brand: "Apple" }, { id: 2, name: "Pixel 8", brand: "Google" }];
  assert.deepEqual(rankedMatches(products, "iphnoe").map((product) => product.id), [1]);
});
