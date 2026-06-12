const { InventoryReservation, Product, ProductVariant } = require("../models");

async function findStockItem(item, transaction) {
  const model = item.variantId ? ProductVariant : Product;
  return model.findByPk(item.variantId || item.productId, {
    transaction,
    lock: transaction.LOCK?.UPDATE,
  });
}

async function reserveInventory(orderId, items, transaction, expiresAt) {
  for (const item of items) {
    const stockItem = await findStockItem(item, transaction);
    if (!stockItem || !stockItem.active) throw new Error(`Product unavailable: ${item.productId}`);
    if (stockItem.stockQuantity - stockItem.reservedQuantity < item.quantity) {
      throw new Error(`Insufficient stock for ${stockItem.name}`);
    }
    await stockItem.increment("reservedQuantity", { by: item.quantity, transaction });
    await InventoryReservation.create(
      {
        orderId,
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: item.quantity,
        expiresAt,
      },
      { transaction }
    );
  }
}

async function settleReservations(orderId, action, transaction) {
  const reservations = await InventoryReservation.findAll({
    where: { orderId, status: "reserved" },
    transaction,
    lock: transaction.LOCK?.UPDATE,
  });
  for (const reservation of reservations) {
    const stockItem = await findStockItem(reservation, transaction);
    await stockItem.decrement("reservedQuantity", {
      by: reservation.quantity,
      transaction,
    });
    if (action === "commit") {
      await stockItem.decrement("stockQuantity", {
        by: reservation.quantity,
        transaction,
      });
    }
    await reservation.update(
      { status: action === "commit" ? "committed" : "released" },
      { transaction }
    );
  }
}

module.exports = { reserveInventory, settleReservations };
