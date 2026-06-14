const test = require("node:test");
const assert = require("node:assert/strict");
const { Op } = require("sequelize");
const { discoveryQuery } = require("../src/productDiscovery");
test("builds bounded product discovery queries", () => {
  const query = discoveryQuery({ page: "2", limit: "500", categoryId: "3", sort: "price_asc", search: "phone", brand: "Apple", minPrice: "100", maxPrice: "900" });
  assert.equal(query.page, 2);
  assert.equal(query.limit, 50);
  assert.equal(query.offset, 50);
  assert.equal(query.where.categoryId, 3);
  assert.equal(query.where.brand, "Apple");
  assert.equal(query.where.priceAmount[Op.gte], 10000);
  assert.equal(query.where.priceAmount[Op.lte], 90000);
  assert.deepEqual(query.order, [["priceAmount", "ASC"]]);
});
