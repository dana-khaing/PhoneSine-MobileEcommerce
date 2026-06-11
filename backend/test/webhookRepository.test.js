const test = require("node:test");
const assert = require("node:assert/strict");
const models = require("../models");
const { processStripeEvent } = require("../src/webhookRepository");

test("does not update orders for an already processed Stripe event", async () => {
  const originalTransaction = models.sequelize.transaction;
  const originalFindOrCreate = models.StripeEvent.findOrCreate;
  const originalUpdate = models.Order.update;
  let updateCount = 0;

  models.sequelize.transaction = async (callback) => callback({ id: "transaction" });
  models.StripeEvent.findOrCreate = async () => [
    { eventId: "evt_duplicate" },
    false,
  ];
  models.Order.update = async () => {
    updateCount += 1;
  };

  try {
    const result = await processStripeEvent({
      id: "evt_duplicate",
      type: "checkout.session.completed",
      data: { object: { id: "cs_test_123" } },
    });

    assert.equal(result.duplicate, true);
    assert.equal(updateCount, 0);
  } finally {
    models.sequelize.transaction = originalTransaction;
    models.StripeEvent.findOrCreate = originalFindOrCreate;
    models.Order.update = originalUpdate;
  }
});

test("stores new Stripe events and updates orders in one transaction", async () => {
  const transaction = { id: "transaction" };
  const originalTransaction = models.sequelize.transaction;
  const originalFindOrCreate = models.StripeEvent.findOrCreate;
  const originalUpdate = models.Order.update;
  let updateOptions;

  models.sequelize.transaction = async (callback) => callback(transaction);
  models.StripeEvent.findOrCreate = async () => [
    { eventId: "evt_new" },
    true,
  ];
  models.Order.update = async (_record, options) => {
    updateOptions = options;
  };

  try {
    const result = await processStripeEvent({
      id: "evt_new",
      type: "checkout.session.completed",
      data: { object: { id: "cs_test_123" } },
    });

    assert.equal(result.duplicate, false);
    assert.equal(updateOptions.transaction, transaction);
    assert.deepEqual(updateOptions.where, { stripeSessionId: "cs_test_123" });
  } finally {
    models.sequelize.transaction = originalTransaction;
    models.StripeEvent.findOrCreate = originalFindOrCreate;
    models.Order.update = originalUpdate;
  }
});
