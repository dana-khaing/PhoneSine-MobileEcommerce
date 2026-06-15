const ROLE_PERMISSIONS = {
  admin: ["*"],
  catalog: ["admin.access", "catalog.manage", "procurement.manage", "reviews.manage"],
  fulfillment: ["admin.access", "orders.read", "fulfillment.manage", "returns.manage"],
  support: ["admin.access", "orders.read", "reviews.manage", "support.manage"],
  operations: ["admin.access", "operations.manage", "orders.read", "payments.manage", "procurement.manage", "promotions.manage"],
  customer: [],
};

function hasPermission(role, permission) {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes("*") || permissions.includes(permission);
}

function adminRequestPermission(method, path) {
  if (/^\/users(?:\/|$)/.test(path)) return "roles.manage";
  if (/^\/orders\/[^/]+\/refund$/.test(path) || path === "/reconcile" || path === "/health/payments") return "payments.manage";
  if (/^\/orders\/[^/]+\/fulfillment$/.test(path)) return "fulfillment.manage";
  if (/^\/orders(?:\/|$)/.test(path)) return "orders.read";
  if (/^\/returns(?:\/|$)/.test(path)) return "returns.manage";
  if (/^\/(?:products|categories|bundles)(?:\/|$)/.test(path)) return "catalog.manage";
  if (/^\/(?:suppliers|warehouses|purchase-orders)(?:\/|$)/.test(path)) return "procurement.manage";
  if (/^\/reviews(?:\/|$)/.test(path)) return "reviews.manage";
  if (/^\/tickets(?:\/|$)/.test(path)) return "support.manage";
  if (/^\/(?:promotions|gift-cards)(?:\/|$)/.test(path)) return "promotions.manage";
  return "operations.manage";
}

module.exports = { ROLE_PERMISSIONS, adminRequestPermission, hasPermission };
