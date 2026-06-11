const test = require("node:test");
const assert = require("node:assert/strict");
const models = require("../models");
const { processStripeEvent } = require("../src/webhookRepository");

test("does not update orders for an already processed Stripe event", async () => {
  const originalTransaction = models.sequelize.transaction;
  const originalFindOrCreate = models.StripeEvent.findOrCreate;
  const originalUpdate = models.Order.update;
  const originalFindOne = models.Order.findOne;
  let updateCount = 0;

  models.sequelize.transaction = async (callback) => callback({ id: "transaction" });
  models.StripeEvent.findOrCreate = async () => [
    { eventId: "evt_duplicate" },
    false,
  ];
  models.Order.update = async () => {
    updateCount += 1;
  };
  models.Order.findOne = async () => null;

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
    models.Order.findOne = originalFindOne;
  }
});

test("stores new Stripe events and updates orders in one transaction", async () => {
  const transaction = { id: "transaction" };
  const originalTransaction = models.sequelize.transaction;
  const originalFindOrCreate = models.StripeEvent.findOrCreate;
  const originalUpdate = models.Order.update;
  const originalFindOne = models.Order.findOne;
  const originalEventCreate = models.OrderEvent.create;
  const originalFindReservations = models.InventoryReservation.findAll;
  const originalNotificationCreate = models.Notification.create;
  const originalUserUpdate = models.Userdetail.update;
  let updateOptions;
  const order = {
    id: 42,
    status: "pending",
    email: "buyer@example.com",
    update: async (_record, options) => {
      updateOptions = options;
      order.status = "paid";
    },
  };

  models.sequelize.transaction = async (callback) => callback(transaction);
  models.StripeEvent.findOrCreate = async () => [
    { eventId: "evt_new" },
    true,
  ];
  models.Order.findOne = async () => order;
  models.OrderEvent.create = async () => {};
  models.InventoryReservation.findAll = async () => [];
  models.Notification.create = async () => {};
  models.Userdetail.update = async () => {};

  try {
    const result = await processStripeEvent({
      id: "evt_new",
      type: "checkout.session.completed",
      data: { object: { id: "cs_test_123" } },
    });

    assert.equal(result.duplicate, false);
    assert.equal(updateOptions.transaction, transaction);
    assert.equal(order.status, "paid");
  } finally {
    models.sequelize.transaction = originalTransaction;
    models.StripeEvent.findOrCreate = originalFindOrCreate;
    models.Order.update = originalUpdate;
    models.Order.findOne = originalFindOne;
    models.OrderEvent.create = originalEventCreate;
    models.InventoryReservation.findAll = originalFindReservations;
    models.Notification.create = originalNotificationCreate;
    models.Userdetail.update = originalUserUpdate;
  }
});
