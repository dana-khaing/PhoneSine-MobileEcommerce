const { Notification } = require("../models");

const subjects = {
  order_confirmation: "Your Phone Sine order is confirmed",
  payment_receipt: "Your Phone Sine payment receipt",
  shipped: "Your Phone Sine order has shipped",
  delivered: "Your Phone Sine order was delivered",
  refund: "Your Phone Sine refund update",
};

async function queueNotification(order, type, message, transaction) {
  return Notification.create(
    {
      orderId: order.id,
      recipient: order.email,
      type,
      subject: subjects[type] || "Phone Sine order update",
      body: message,
    },
    { transaction }
  );
}

async function deliverPendingNotifications(limit = 25) {
  const notifications = await Notification.findAll({
    where: { status: "pending" },
    limit,
    order: [["createdAt", "ASC"]],
  });
  let delivered = 0;
  for (const notification of notifications) {
    try {
      if (process.env.EMAIL_WEBHOOK_URL) {
        const response = await fetch(process.env.EMAIL_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: notification.recipient,
            subject: notification.subject,
            text: notification.body,
          }),
        });
        if (!response.ok) throw new Error("Email provider rejected notification");
      } else {
        console.log(`[email:${notification.recipient}] ${notification.subject}`);
      }
      await notification.update({ status: "sent", sentAt: new Date() });
      delivered += 1;
    } catch {
      await notification.update({ status: "failed" });
    }
  }
  return delivered;
}

module.exports = { deliverPendingNotifications, queueNotification };
