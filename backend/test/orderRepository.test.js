const test = require("node:test");
const assert = require("node:assert/strict");
const models = require("../models");
const { createOrderWithItems } = require("../src/orderRepository");

test("creates an order and its items in the same transaction", async () => {
  const transaction = { id: "transaction" };
  const originalTransaction = models.sequelize.transaction;
  const originalCreate = models.Order.create;
  const originalBulkCreate = models.OrderItem.bulkCreate;
  const calls = [];

  models.sequelize.transaction = async (callback) => callback(transaction);
  models.Order.create = async (record, options) => {
    calls.push({ type: "order", record, options });
    return { id: 42, ...record };
  };
  models.OrderItem.bulkCreate = async (records, options) => {
    calls.push({ type: "items", records, options });
  };

  try {
    const order = await createOrderWithItems({
      checkout: {
        email: "buyer@example.com",
        deliveryMethod: "standard",
      },
      checkoutItems: [
        { productId: 1, name: "Phone", unitAmount: 10000, quantity: 1 },
      ],
      userId: 7,
    });

    assert.equal(order.id, 42);
    assert.equal(calls[0].options.transaction, transaction);
    assert.equal(calls[1].options.transaction, transaction);
    assert.equal(calls[1].records[0].orderId, 42);
    assert.equal(calls[0].record.userId, 7);
  } finally {
    models.sequelize.transaction = originalTransaction;
    models.Order.create = originalCreate;
    models.OrderItem.bulkCreate = originalBulkCreate;
  }
});
