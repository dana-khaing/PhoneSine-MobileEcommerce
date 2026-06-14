const test = require("node:test");
const assert = require("node:assert/strict");
const { adminRequestPermission, hasPermission } = require("../src/permissions");

test("grants staff only their assigned permissions", () => {
  assert.equal(hasPermission("admin", "roles.manage"), true);
  assert.equal(hasPermission("catalog", "catalog.manage"), true);
  assert.equal(hasPermission("catalog", "payments.manage"), false);
  assert.equal(hasPermission("fulfillment", "fulfillment.manage"), true);
  assert.equal(hasPermission("support", "support.manage"), true);
  assert.equal(hasPermission("customer", "admin.access"), false);
});

test("maps admin routes to granular permissions", () => {
  assert.equal(adminRequestPermission("PATCH", "/users/3/role"), "roles.manage");
  assert.equal(adminRequestPermission("POST", "/orders/2/refund"), "payments.manage");
  assert.equal(adminRequestPermission("PATCH", "/orders/2/fulfillment"), "fulfillment.manage");
  assert.equal(adminRequestPermission("POST", "/products"), "catalog.manage");
  assert.equal(adminRequestPermission("GET", "/tickets"), "support.manage");
});
