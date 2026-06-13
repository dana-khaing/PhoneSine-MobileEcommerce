const { Op, fn, col } = require("sequelize");
const { Notification, Order, Product, ProductVariant } = require("../models");
async function operationsSummary() {
  const [orders, revenue, lowProducts, lowVariants] = await Promise.all([
    Order.count(),
    Order.sum("totalAmount", { where: { status: { [Op.in]: ["paid", "processing", "shipped", "delivered"] } } }),
    Product.findAll({ where: { active: true, stockQuantity: { [Op.lte]: col("reservedQuantity") } }, attributes: ["id", "name", "stockQuantity", "reservedQuantity"] }),
    ProductVariant.findAll({ where: { active: true, stockQuantity: { [Op.lte]: col("reservedQuantity") } }, attributes: ["id", "name", "sku", "stockQuantity", "reservedQuantity"] }),
  ]);
  return { orders, revenue: revenue || 0, lowStock: [...lowProducts, ...lowVariants] };
}
async function queueLowStockAlerts(recipient) {
  const summary = await operationsSummary();
  for (const item of summary.lowStock) await Notification.create({ recipient, type: "low_stock", subject: `Low stock: ${item.name}`, body: `${item.name} has ${item.stockQuantity - item.reservedQuantity} available`, status: "pending" });
  return summary.lowStock.length;
}
function operationsSummaryToCsv(summary) {
  return [
    ["metric", "value"],
    ["orders", summary.orders],
    ["paid_revenue", summary.revenue],
    ["low_stock_items", summary.lowStock.length],
  ].map((row) => row.join(",")).join("\n");
}
module.exports = { operationsSummary, operationsSummaryToCsv, queueLowStockAlerts };
