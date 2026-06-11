const { InventoryReservation, Product } = require("../models");

async function reserveInventory(orderId, items, transaction, expiresAt) {
  for (const item of items) {
    const product = await Product.findByPk(item.productId, {
      transaction,
      lock: transaction.LOCK?.UPDATE,
    });
    if (!product || !product.active) throw new Error(`Product unavailable: ${item.productId}`);
    if (product.stockQuantity - product.reservedQuantity < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }
    await product.increment("reservedQuantity", { by: item.quantity, transaction });
    await InventoryReservation.create(
      {
        orderId,
        productId: item.productId,
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
    const product = await Product.findByPk(reservation.productId, {
      transaction,
      lock: transaction.LOCK?.UPDATE,
    });
    await product.decrement("reservedQuantity", {
      by: reservation.quantity,
      transaction,
    });
    if (action === "commit") {
      await product.decrement("stockQuantity", {
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
