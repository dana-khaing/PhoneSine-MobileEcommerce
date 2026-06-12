const test = require("node:test");
const assert = require("node:assert/strict");
const { discoveryQuery } = require("../src/productDiscovery");
test("builds bounded product discovery queries", () => {
  const query = discoveryQuery({ page: "2", limit: "500", categoryId: "3", sort: "price_asc", search: "phone" });
  assert.equal(query.page, 2);
  assert.equal(query.limit, 50);
  assert.equal(query.offset, 50);
  assert.equal(query.where.categoryId, 3);
  assert.deepEqual(query.order, [["priceAmount", "ASC"]]);
});
