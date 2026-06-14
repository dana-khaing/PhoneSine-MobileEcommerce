const { Order, OrderEvent, Refund, StripeEvent, Userdetail, sequelize } = require("../models");
const { orderStatusForStripeEvent } = require("./orderService");
const { settleReservations } = require("./inventoryService");
const { queueNotification } = require("./notificationService");
const { audit } = require("./auditService");
const { releasePromotionUsage } = require("./promotionService");
const { awardOrderPoints } = require("./loyaltyService");

async function processStripeEvent(event) {
  return sequelize.transaction(async (transaction) => {
    const [storedEvent, created] = await StripeEvent.findOrCreate({
      where: { eventId: event.id },
      defaults: {
        eventId: event.id,
        type: event.type,
        processedAt: new Date(),
      },
      transaction,
    });

    if (!created) {
      return { duplicate: true, eventId: storedEvent.eventId };
    }

    const status = orderStatusForStripeEvent(event.type);
    const stripeObject = event.data?.object;
    const sessionId = stripeObject?.id;
    if (event.type.startsWith("charge.dispute.")) {
      const order = await Order.findOne({
        where: { stripePaymentIntentId: stripeObject?.payment_intent },
        transaction,
        lock: transaction.LOCK?.UPDATE,
      });
      if (order) {
        const disputeStatus = event.type.replace("charge.dispute.", "");
        await order.update(
          {
            status: disputeStatus === "closed" && stripeObject.status === "won" ? "paid" : "disputed",
            disputeId: stripeObject.id,
            disputeStatus: stripeObject.status || disputeStatus,
          },
          { transaction }
        );
        await OrderEvent.create(
          { orderId: order.id, type: event.type, message: `Dispute ${stripeObject.id}: ${stripeObject.status || disputeStatus}` },
          { transaction }
        );
        await queueNotification(order, "dispute", `Payment dispute update for order #${order.id}.`, transaction);
        await audit("stripe", "dispute_updated", "order", order.id, { disputeId: stripeObject.id, status: stripeObject.status }, transaction);
      }
      return { duplicate: false, eventId: storedEvent.eventId };
    }
    if (event.type === "refund.updated") {
      const refund = await Refund.findOne({ where: { stripeRefundId: stripeObject?.id }, transaction });
      if (refund) await refund.update({ status: stripeObject.status }, { transaction });
      return { duplicate: false, eventId: storedEvent.eventId };
    }
    if (status && sessionId) {
      const order = await Order.findOne({
        where:
          event.type === "charge.refunded"
            ? { stripePaymentIntentId: stripeObject.payment_intent }
            : { stripeSessionId: sessionId },
        transaction,
        lock: transaction.LOCK?.UPDATE,
      });
      if (order) {
        const session = stripeObject;
        if (status === "paid" && order.status === "pending") {
          await settleReservations(order.id, "commit", transaction);
          await order.update(
            {
              status: "paid",
              stripeCustomerId: session.customer || order.stripeCustomerId,
              stripePaymentIntentId:
                session.payment_intent || order.stripePaymentIntentId,
            },
            { transaction }
          );
          if (order.userId && session.customer) {
            await Userdetail.update(
              { stripeCustomerId: session.customer },
              { where: { id: order.userId }, transaction }
            );
          }
          await awardOrderPoints(order, transaction);
          await queueNotification(
            order,
            "payment_receipt",
            `Payment received for order #${order.id}.`,
            transaction
          );
          await queueNotification(
            order,
            "order_confirmation",
            `Order #${order.id} is confirmed.`,
            transaction
          );
        } else if (status === "paid" && order.status !== "paid") {
          await order.update({ status: "payment_review" }, { transaction });
          await queueNotification(
            order,
            "payment_receipt",
            `Payment for order #${order.id} requires manual review.`,
            transaction
          );
        } else if (status === "cancelled") {
          await settleReservations(order.id, "release", transaction);
          await releasePromotionUsage(order.id, transaction);
          await order.update({ status }, { transaction });
        } else if (status === "failed") {
          await settleReservations(order.id, "release", transaction);
          await releasePromotionUsage(order.id, transaction);
          await order.update({ status }, { transaction });
        } else if (status === "refunded") {
          const refundAmount = session.amount_refunded || order.totalAmount;
          const refundStatus =
            refundAmount >= order.totalAmount ? "refunded" : "partially_refunded";
          await order.update(
            { status: refundStatus, refundAmount },
            { transaction }
          );
          await queueNotification(
            order,
            "refund",
            `Refund processed for order #${order.id}.`,
            transaction
          );
        }
        await audit("stripe", "webhook_processed", "order", order.id, { eventId: event.id, type: event.type }, transaction);
        await OrderEvent.create(
          {
            orderId: order.id,
            type: event.type,
            message: `Order status changed to ${order.status}`,
          },
          { transaction }
        );
      }
    }

    return { duplicate: false, eventId: storedEvent.eventId };
  });
}

module.exports = { processStripeEvent };
