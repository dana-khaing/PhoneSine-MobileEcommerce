const { Notification } = require("../models");
const { sendEmail, sendSms } = require("./providerService");

const subjects = {
  order_confirmation: "Your Phone Sine order is confirmed",
  payment_receipt: "Your Phone Sine payment receipt",
  shipped: "Your Phone Sine order has shipped",
  delivered: "Your Phone Sine order was delivered",
  refund: "Your Phone Sine refund update",
  dispute: "Action required: payment dispute update",
};
const smsTypes = new Set(["order_confirmation", "shipped", "delivered", "refund", "dispute"]);

function smsRecipient(order) {
  try {
    const address = typeof order.shippingAddress === "string" ? JSON.parse(order.shippingAddress) : order.shippingAddress;
    return String(address?.phone || "").trim() || null;
  } catch {
    return null;
  }
}

async function queueNotification(order, type, message, transaction) {
  const email = await Notification.create(
    {
      orderId: order.id,
      recipient: order.email,
      channel: "email",
      type,
      subject: subjects[type] || "Phone Sine order update",
      body: message,
    },
    { transaction }
  );
  const phone = smsRecipient(order);
  if (process.env.ENABLE_SMS_NOTIFICATIONS === "true" && phone && smsTypes.has(type)) {
    await Notification.create({
      orderId: order.id,
      recipient: phone,
      channel: "sms",
      type,
      subject: subjects[type] || "Phone Sine order update",
      body: message,
    }, { transaction });
  }
  return email;
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
      if (notification.channel === "sms") {
        await sendSms({ to: notification.recipient, text: notification.body });
      } else if (process.env.RESEND_API_KEY) {
        await sendEmail({ to: notification.recipient, subject: notification.subject, text: notification.body });
      } else if (process.env.EMAIL_WEBHOOK_URL) {
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

module.exports = { deliverPendingNotifications, queueNotification, smsRecipient };
