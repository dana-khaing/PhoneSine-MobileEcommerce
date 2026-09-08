const test = require("node:test");
const assert = require("node:assert/strict");
const adminRouter = require("../src/admin");
const catalogueRouter = require("../src/admin/catalogueRoutes");
const procurementRouter = require("../src/admin/procurementRoutes");

function registeredRoutes(router) {
  return router.stack.flatMap((layer) => {
    if (!layer.route) return [];
    return Object.keys(layer.route.methods).map((method) => `${method.toUpperCase()} ${layer.route.path}`);
  });
}

test("protects extracted admin routers with shared staff permissions", () => {
  assert.deepEqual(
    adminRouter.stack.slice(0, 4).map((layer) => layer.name),
    ["requireStaff", "requireAdminRequestPermission", "router", "router"]
  );
});

test("registers every catalogue management endpoint", () => {
  assert.deepEqual(registeredRoutes(catalogueRouter), [
    "PATCH /products/:id",
    "GET /products",
    "GET /categories",
    "POST /categories",
    "POST /products/:id/variants",
    "PATCH /products/:productId/variants/:id",
    "DELETE /products/:productId/variants/:id",
    "POST /products",
    "GET /products-export.csv",
    "POST /products-import.csv",
    "POST /bundles",
    "GET /bundles",
    "PATCH /bundles/:id",
    "DELETE /products/:id",
    "POST /products/:id/restore",
  ]);
});

test("registers every procurement management endpoint", () => {
  assert.deepEqual(registeredRoutes(procurementRouter), [
    "GET /suppliers",
    "POST /suppliers",
    "GET /warehouses",
    "POST /warehouses",
    "GET /purchase-orders",
    "POST /purchase-orders",
    "POST /purchase-orders/:id/receive",
  ]);
});
