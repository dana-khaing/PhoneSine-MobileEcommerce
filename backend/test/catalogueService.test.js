const test = require("node:test"); const assert = require("node:assert/strict"); const { parseProductCsv, productsToCsv } = require("../src/catalogueService");
test("imports and exports product CSV data", () => {
  assert.equal(parseProductCsv("name,brand,priceAmount,stockQuantity\nPhone,PS,100,2")[0].priceAmount, 100);
  assert.match(productsToCsv([{ id: 1, name: "Phone", brand: "PS", priceAmount: 100, stockQuantity: 2, active: true }]), /Phone,PS,100,2/);
});
