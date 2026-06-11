const { Op } = require("sequelize");
const { InventoryReservation, Order, OrderEvent, sequelize } = require("../models");
const { nextFulfillmentStatus } = require("./commerceService");
const { settleReservations } = require("./inventoryService");
const { queueNotification } = require("./notificationService");
const { createRefund, expireCheckoutSession } = require("./stripeApi");

async function cancelOrRefundOrder(order, requestedBy, requestedAmount) {
  if (["pending", "failed"].includes(order.status)) {
    if (order.stripeSessionId) await expireCheckoutSession(order.stripeSessionId);
    return sequelize.transaction(async (transaction) => {
      await settleReservations(order.id, "release", transaction);
      await order.update({ status: "cancelled" }, { transaction });
      await OrderEvent.create(
        { orderId: order.id, type: "cancelled", message: `Cancelled by ${requestedBy}` },
        { transaction }
      );
      return order;
    });
  }
  if (["paid", "processing", "shipped", "delivered"].includes(order.status)) {
    if (!order.stripePaymentIntentId) throw new Error("Order payment cannot be refunded");
    const refund = await createRefund(order.stripePaymentIntentId, requestedAmount, {
      order_id: order.id,
    });
    return sequelize.transaction(async (transaction) => {
      await order.update({ status: "refund_pending" }, { transaction });
      await OrderEvent.create(
        {
          orderId: order.id,
          type: "refund_pending",
          message: `Refund ${refund.id} requested by ${requestedBy}`,
        },
        { transaction }
      );
      await queueNotification(
        order,
        "refund",
        `Refund requested for order #${order.id}.`,
        transaction
      );
      return order;
    });
  }
  throw new Error(`Order cannot be cancelled from ${order.status}`);
}

async function updateFulfillment(order, update) {
  const status = nextFulfillmentStatus(order.status, update.status);
  return sequelize.transaction(async (transaction) => {
    await order.update(
      {
        status,
        trackingNumber: update.trackingNumber || order.trackingNumber,
        carrier: update.carrier || order.carrier,
      },
      { transaction }
    );
    await OrderEvent.create(
      {
        orderId: order.id,
        type: status,
        message: update.message || `Order moved to ${status}`,
        metadata: {
          trackingNumber: update.trackingNumber,
          carrier: update.carrier,
        },
      },
      { transaction }
    );
    if (["shipped", "delivered"].includes(status)) {
      await queueNotification(
        order,
        status,
        `Order #${order.id} is ${status}.`,
        transaction
      );
    }
    return order;
  });
}

async function cleanupAbandonedOrders(now = new Date()) {
  const reservations = await InventoryReservation.findAll({
    where: { status: "reserved", expiresAt: { [Op.lt]: now } },
    attributes: ["orderId"],
    group: ["orderId"],
  });
  let cleaned = 0;
  for (const reservation of reservations) {
    await sequelize.transaction(async (transaction) => {
      const order = await Order.findByPk(reservation.orderId, {
        transaction,
        lock: transaction.LOCK?.UPDATE,
      });
      if (order && order.status === "pending") {
        if (order.stripeSessionId) {
          await expireCheckoutSession(order.stripeSessionId);
        }
        await settleReservations(order.id, "release", transaction);
        await order.update({ status: "cancelled" }, { transaction });
        await OrderEvent.create(
          { orderId: order.id, type: "expired", message: "Checkout reservation expired" },
          { transaction }
        );
        cleaned += 1;
      }
    });
  }
  return cleaned;
}

async function failOrderAndReleaseInventory(order) {
  return sequelize.transaction(async (transaction) => {
    await settleReservations(order.id, "release", transaction);
    await order.update({ status: "failed" }, { transaction });
    await OrderEvent.create(
      {
        orderId: order.id,
        type: "failed",
        message: "Payment session creation failed and stock was released",
      },
      { transaction }
    );
  });
}

module.exports = {
  cancelOrRefundOrder,
  cleanupAbandonedOrders,
  failOrderAndReleaseInventory,
  updateFulfillment,
};
