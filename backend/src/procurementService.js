const { Product, PurchaseOrder, PurchaseOrderItem, Supplier, Warehouse, WarehouseStock, sequelize } = require("../models");

function normalizePurchaseOrder(input) {
  const supplierId = Number(input.supplierId);
  const warehouseId = Number(input.warehouseId);
  if (!Number.isInteger(supplierId) || supplierId < 1 || !Number.isInteger(warehouseId) || warehouseId < 1) {
    throw new Error("Supplier and warehouse are required");
  }
  if (!Array.isArray(input.items) || input.items.length === 0) throw new Error("At least one purchase-order item is required");
  const items = input.items.map((item) => {
    const productId = Number(item.productId);
    const quantity = Number(item.quantity);
    const unitCostAmount = Number(item.unitCostAmount);
    if (![productId, quantity, unitCostAmount].every(Number.isInteger) || productId < 1 || quantity < 1 || unitCostAmount < 0) {
      throw new Error("Purchase-order items require valid product, quantity, and unit cost");
    }
    return { productId, quantity, unitCostAmount };
  });
  return { supplierId, warehouseId, expectedAt: input.expectedAt || null, items, totalAmount: items.reduce((sum, item) => sum + item.quantity * item.unitCostAmount, 0) };
}

async function createPurchaseOrder(input) {
  const values = normalizePurchaseOrder(input);
  return sequelize.transaction(async (transaction) => {
    if (!await Supplier.findOne({ where: { id: values.supplierId, active: true }, transaction })) throw new Error("Supplier not found");
    if (!await Warehouse.findOne({ where: { id: values.warehouseId, active: true }, transaction })) throw new Error("Warehouse not found");
    const products = await Product.count({ where: { id: values.items.map((item) => item.productId), active: true }, transaction });
    if (products !== new Set(values.items.map((item) => item.productId)).size) throw new Error("Product not found");
    const order = await PurchaseOrder.create(values, { transaction });
    await PurchaseOrderItem.bulkCreate(values.items.map((item) => ({ ...item, purchaseOrderId: order.id })), { transaction });
    return order;
  });
}

async function receivePurchaseOrder(id) {
  return sequelize.transaction(async (transaction) => {
    const order = await PurchaseOrder.findByPk(id, { include: ["items"], transaction, lock: transaction.LOCK.UPDATE });
    if (!order) throw new Error("Purchase order not found");
    if (order.status === "received") return order;
    for (const item of order.items) {
      const [stock] = await WarehouseStock.findOrCreate({
        where: { warehouseId: order.warehouseId, productId: item.productId },
        defaults: { warehouseId: order.warehouseId, productId: item.productId, quantity: 0 },
        transaction,
      });
      await stock.increment("quantity", { by: item.quantity, transaction });
      await Product.increment("stockQuantity", { by: item.quantity, where: { id: item.productId }, transaction });
      await item.update({ receivedQuantity: item.quantity }, { transaction });
    }
    await order.update({ status: "received", receivedAt: new Date() }, { transaction });
    return order;
  });
}

module.exports = { createPurchaseOrder, normalizePurchaseOrder, receivePurchaseOrder };
