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
  const originalAuditCreate = models.AuditLog.create;
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
  models.AuditLog.create = async () => {};

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
    models.AuditLog.create = originalAuditCreate;
  }
});

test("records Stripe disputes and alerts the customer", async () => {
  const originals = {
    transaction: models.sequelize.transaction,
    findOrCreate: models.StripeEvent.findOrCreate,
    findOne: models.Order.findOne,
    eventCreate: models.OrderEvent.create,
    notificationCreate: models.Notification.create,
    auditCreate: models.AuditLog.create,
  };
  const order = {
    id: 51,
    email: "buyer@example.com",
    update: async (values) => Object.assign(order, values),
  };
  models.sequelize.transaction = async (callback) => callback({ LOCK: { UPDATE: "UPDATE" } });
  models.StripeEvent.findOrCreate = async () => [{ eventId: "evt_dispute" }, true];
  models.Order.findOne = async () => order;
  models.OrderEvent.create = async () => {};
  models.Notification.create = async () => {};
  models.AuditLog.create = async () => {};
  try {
    await processStripeEvent({
      id: "evt_dispute",
      type: "charge.dispute.created",
      data: { object: { id: "dp_test", payment_intent: "pi_test", status: "needs_response" } },
    });
    assert.equal(order.status, "disputed");
    assert.equal(order.disputeId, "dp_test");
  } finally {
    models.sequelize.transaction = originals.transaction;
    models.StripeEvent.findOrCreate = originals.findOrCreate;
    models.Order.findOne = originals.findOne;
    models.OrderEvent.create = originals.eventCreate;
    models.Notification.create = originals.notificationCreate;
    models.AuditLog.create = originals.auditCreate;
  }
});

test("routes a late successful payment to manual review", async () => {
  const originals = {
    transaction: models.sequelize.transaction,
    findOrCreate: models.StripeEvent.findOrCreate,
    findOne: models.Order.findOne,
    eventCreate: models.OrderEvent.create,
    notificationCreate: models.Notification.create,
    auditCreate: models.AuditLog.create,
  };
  const order = {
    id: 52,
    status: "cancelled",
    email: "buyer@example.com",
    update: async (values) => Object.assign(order, values),
  };
  models.sequelize.transaction = async (callback) => callback({ LOCK: { UPDATE: "UPDATE" } });
  models.StripeEvent.findOrCreate = async () => [{ eventId: "evt_late" }, true];
  models.Order.findOne = async () => order;
  models.OrderEvent.create = async () => {};
  models.Notification.create = async () => {};
  models.AuditLog.create = async () => {};
  try {
    await processStripeEvent({
      id: "evt_late",
      type: "checkout.session.completed",
      data: { object: { id: "cs_late", payment_status: "paid" } },
    });
    assert.equal(order.status, "payment_review");
  } finally {
    models.sequelize.transaction = originals.transaction;
    models.StripeEvent.findOrCreate = originals.findOrCreate;
    models.Order.findOne = originals.findOne;
    models.OrderEvent.create = originals.eventCreate;
    models.Notification.create = originals.notificationCreate;
    models.AuditLog.create = originals.auditCreate;
  }
});
