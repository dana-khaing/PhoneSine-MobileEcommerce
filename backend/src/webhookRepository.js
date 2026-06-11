const { Order, StripeEvent, sequelize } = require("../models");
const { orderStatusForStripeEvent } = require("./orderService");

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
    const sessionId = event.data?.object?.id;
    if (status && sessionId) {
      await Order.update(
        { status },
        { where: { stripeSessionId: sessionId }, transaction }
      );
    }

    return { duplicate: false, eventId: storedEvent.eventId };
  });
}

module.exports = { processStripeEvent };
