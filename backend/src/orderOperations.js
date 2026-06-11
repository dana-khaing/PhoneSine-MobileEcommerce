const { Op } = require("sequelize");
const { InventoryReservation, Order, OrderEvent, Refund, sequelize } = require("../models");
const { nextFulfillmentStatus } = require("./commerceService");
const { settleReservations } = require("./inventoryService");
const { queueNotification } = require("./notificationService");
const { createRefund, expireCheckoutSession } = require("./stripeApi");
const { audit } = require("./auditService");
const { releasePromotionUsage } = require("./promotionService");

async function cancelOrRefundOrder(order, requestedBy, requestedAmount) {
  if (["pending", "failed"].includes(order.status)) {
    if (order.stripeSessionId) await expireCheckoutSession(order.stripeSessionId);
    return sequelize.transaction(async (transaction) => {
      await settleReservations(order.id, "release", transaction);
      await releasePromotionUsage(order.id, transaction);
      await order.update({ status: "cancelled" }, { transaction });
      await OrderEvent.create(
        { orderId: order.id, type: "cancelled", message: `Cancelled by ${requestedBy}` },
        { transaction }
      );
      return order;
    });
  }
  if (["paid", "processing", "shipped", "delivered", "refund_pending", "partially_refunded"].includes(order.status)) {
    return sequelize.transaction(async (transaction) => {
      const lockedOrder = await Order.findByPk(order.id, {
        transaction,
        lock: transaction.LOCK?.UPDATE,
      });
      if (!lockedOrder.stripePaymentIntentId) throw new Error("Order payment cannot be refunded");
      if (!["paid", "processing", "shipped", "delivered", "refund_pending", "partially_refunded"].includes(lockedOrder.status)) {
        throw new Error(`Order cannot be refunded from ${lockedOrder.status}`);
      }
      const requestedRefunds = Number(await Refund.sum("amount", {
        where: { orderId: lockedOrder.id, status: { [Op.notIn]: ["failed", "canceled"] } },
        transaction,
      })) || 0;
      const remaining = lockedOrder.totalAmount - Math.max(lockedOrder.refundAmount, requestedRefunds);
      const amount = requestedAmount == null ? remaining : Number(requestedAmount);
      if (!Number.isInteger(amount) || amount < 1 || amount > remaining) {
        throw new Error(`Refund amount must be between 1 and ${remaining}`);
      }
      const refund = await createRefund(
        lockedOrder.stripePaymentIntentId,
        amount,
        { order_id: lockedOrder.id },
        `refund-${lockedOrder.id}-${requestedRefunds}-${amount}`
      );
      await Refund.findOrCreate({
        where: { stripeRefundId: refund.id },
        defaults: {
          orderId: lockedOrder.id,
          stripeRefundId: refund.id,
          amount,
          currency: lockedOrder.currency,
          status: refund.status || "pending",
          requestedBy,
        },
        transaction,
      });
      await lockedOrder.update({ status: "refund_pending" }, { transaction });
      await OrderEvent.create(
        {
          orderId: order.id,
          type: "refund_pending",
          message: `Refund ${refund.id} for ${amount} requested by ${requestedBy}`,
        },
        { transaction }
      );
      await queueNotification(
        order,
        "refund",
        `Refund requested for order #${order.id}.`,
        transaction
      );
      await audit(requestedBy, "refund_requested", "order", lockedOrder.id, { amount, refundId: refund.id }, transaction);
      return lockedOrder;
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
    await audit("system", "fulfillment_updated", "order", order.id, { status }, transaction);
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
        await releasePromotionUsage(order.id, transaction);
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
    await releasePromotionUsage(order.id, transaction);
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
