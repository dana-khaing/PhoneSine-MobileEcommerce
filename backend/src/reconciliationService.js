const { Op } = require("sequelize");
const { Order, OrderEvent, sequelize } = require("../models");
const { retrieveCheckoutSession } = require("./stripeApi");
const { verifyPaidCheckoutSession } = require("./orderService");
const { audit } = require("./auditService");
const { settleReservations } = require("./inventoryService");
const { queueNotification } = require("./notificationService");
const { awardOrderPoints } = require("./loyaltyService");

async function reconcilePayments(limit = 50) {
  const orders = await Order.findAll({
    where: {
      stripeSessionId: { [Op.ne]: null },
      status: { [Op.in]: ["pending", "failed", "payment_review"] },
    },
    limit,
    order: [["createdAt", "ASC"]],
  });
  const results = [];
  for (const order of orders) {
    try {
      const session = await retrieveCheckoutSession(order.stripeSessionId);
      const verified = verifyPaidCheckoutSession(session, order);
      const issue = session.amount_total !== order.totalAmount ? "amount_mismatch" : null;
      await sequelize.transaction(async (transaction) => {
        const canConfirm = verified && order.status === "pending";
        const latePayment = verified && order.status !== "pending";
        if (canConfirm) await settleReservations(order.id, "commit", transaction);
        await order.update(
          {
            status: issue || latePayment ? "payment_review" : canConfirm ? "paid" : order.status,
            reconciledAt: new Date(),
            stripeCustomerId: session.customer || order.stripeCustomerId,
            stripePaymentIntentId: session.payment_intent || order.stripePaymentIntentId,
          },
          { transaction }
        );
        await OrderEvent.create(
          {
            orderId: order.id,
            type: "reconciled",
            message: issue || (latePayment ? "Late payment requires review" : canConfirm ? "Payment confirmed during reconciliation" : "Payment checked"),
          },
          { transaction }
        );
        if (canConfirm) {
          await awardOrderPoints(order, transaction);
          await queueNotification(order, "payment_receipt", `Payment received for order #${order.id}.`, transaction);
          await queueNotification(order, "order_confirmation", `Order #${order.id} is confirmed.`, transaction);
        }
        await audit("system", "payment_reconciled", "order", order.id, { verified, issue, latePayment }, transaction);
      });
      results.push({ orderId: order.id, verified, issue });
    } catch (error) {
      results.push({ orderId: order.id, error: error.message });
    }
  }
  return results;
}

module.exports = { reconcilePayments };
