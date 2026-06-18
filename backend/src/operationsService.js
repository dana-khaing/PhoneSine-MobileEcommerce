const { Op, fn, col, literal } = require("sequelize");
const { Notification, Order, OrderItem, Product, ProductVariant, ProductView } = require("../models");

const PAID_STATUSES = ["paid", "processing", "shipped", "delivered"];

function since(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function trendPercent(current, previous) {
  if (!previous) return current ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function toPlain(item) {
  return typeof item?.get === "function" ? item.get({ plain: true }) : item;
}

async function operationsSummary() {
  const currentWindow = since(30);
  const previousWindow = since(60);
  const [
    orders,
    paidOrders,
    pendingOrders,
    refundedOrders,
    revenue,
    currentRevenue,
    previousRevenue,
    lowProducts,
    lowVariants,
    productStock,
    productReserved,
    variantStock,
    variantReserved,
    productViews,
    topProducts,
  ] = await Promise.all([
    Order.count(),
    Order.count({ where: { status: { [Op.in]: PAID_STATUSES } } }),
    Order.count({ where: { status: "pending" } }),
    Order.count({ where: { status: { [Op.in]: ["refunded", "partially_refunded", "refund_pending"] } } }),
    Order.sum("totalAmount", { where: { status: { [Op.in]: PAID_STATUSES } } }),
    Order.sum("totalAmount", { where: { status: { [Op.in]: PAID_STATUSES }, createdAt: { [Op.gte]: currentWindow } } }),
    Order.sum("totalAmount", { where: { status: { [Op.in]: PAID_STATUSES }, createdAt: { [Op.gte]: previousWindow, [Op.lt]: currentWindow } } }),
    Product.findAll({ where: { active: true, stockQuantity: { [Op.lte]: col("reservedQuantity") } }, attributes: ["id", "name", "stockQuantity", "reservedQuantity"] }),
    ProductVariant.findAll({ where: { active: true, stockQuantity: { [Op.lte]: col("reservedQuantity") } }, attributes: ["id", "name", "sku", "stockQuantity", "reservedQuantity"] }),
    Product.sum("stockQuantity", { where: { active: true } }),
    Product.sum("reservedQuantity", { where: { active: true } }),
    ProductVariant.sum("stockQuantity", { where: { active: true } }),
    ProductVariant.sum("reservedQuantity", { where: { active: true } }),
    ProductView.sum("viewCount"),
    OrderItem.findAll({
      attributes: ["productId", "name", [fn("SUM", col("quantity")), "units"]],
      group: ["productId", "name"],
      order: [[literal("units"), "DESC"]],
      limit: 5,
    }),
  ]);
  const totalRevenue = revenue || 0;
  const currentRevenueAmount = currentRevenue || 0;
  const previousRevenueAmount = previousRevenue || 0;
  const totalStock = (productStock || 0) + (variantStock || 0);
  const reservedStock = (productReserved || 0) + (variantReserved || 0);
  const lowStock = [...lowProducts, ...lowVariants].map(toPlain);
  const soldProducts = topProducts.map((item) => {
    const row = toPlain(item);
    return { productId: row.productId, name: row.name, units: Number(row.units || 0) };
  });
  return {
    orders,
    revenue: totalRevenue,
    lowStock,
    dashboard: {
      generatedAt: new Date().toISOString(),
      cards: [
        { id: "orders", label: "Total orders", value: orders, helper: `${paidOrders} paid` },
        { id: "revenue", label: "Paid revenue", value: totalRevenue, format: "currency", helper: `${trendPercent(currentRevenueAmount, previousRevenueAmount)}% vs previous 30 days` },
        { id: "conversion", label: "Order conversion", value: orders ? Math.round((paidOrders / orders) * 100) : 0, suffix: "%", helper: `${pendingOrders} pending checkout` },
        { id: "stock", label: "Available stock", value: Math.max(0, totalStock - reservedStock), helper: `${lowStock.length} low-stock items` },
      ],
      revenueTrend: {
        current30Days: currentRevenueAmount,
        previous30Days: previousRevenueAmount,
        percentChange: trendPercent(currentRevenueAmount, previousRevenueAmount),
      },
      funnel: {
        productViews: productViews || 0,
        orders,
        paidOrders,
        conversionRate: orders ? Math.round((paidOrders / orders) * 100) : 0,
      },
      orderStatuses: {
        paid: paidOrders,
        pending: pendingOrders,
        refunds: refundedOrders,
      },
      stock: {
        total: totalStock,
        reserved: reservedStock,
        available: Math.max(0, totalStock - reservedStock),
        lowStock,
      },
      topProducts: soldProducts,
    },
  };
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
    ["conversion_rate", summary.dashboard?.funnel?.conversionRate || 0],
    ["product_views", summary.dashboard?.funnel?.productViews || 0],
    ["available_stock", summary.dashboard?.stock?.available || 0],
  ].map((row) => row.join(",")).join("\n");
}
module.exports = { operationsSummary, operationsSummaryToCsv, queueLowStockAlerts, trendPercent };
