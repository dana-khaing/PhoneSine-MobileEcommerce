const test = require("node:test"); const assert = require("node:assert/strict"); const { shippingRates } = require("../src/shippingService");
test("calculates domestic and international shipping rates", () => {
  assert.equal(shippingRates({ country: "GB", subtotalAmount: 100000 })[0].amount, 0);
  assert.equal(shippingRates({ country: "US" })[0].amount, 2500);
});
