const test = require("node:test");
const assert = require("node:assert/strict");
const models = require("../models");
const { cancelOrRefundOrder } = require("../src/orderOperations");

test("rejects refunds above the remaining refundable amount", async () => {
  const originalTransaction = models.sequelize.transaction;
  const originalFind = models.Order.findByPk;
  const originalSum = models.Refund.sum;
  const order = {
    id: 44,
    status: "paid",
    totalAmount: 1000,
    refundAmount: 400,
    stripePaymentIntentId: "pi_test",
  };
  models.sequelize.transaction = async (callback) => callback({ LOCK: { UPDATE: "UPDATE" } });
  models.Order.findByPk = async () => order;
  models.Refund.sum = async () => 400;
  try {
    await assert.rejects(() => cancelOrRefundOrder(order, "admin", 601), /between 1 and 600/);
  } finally {
    models.sequelize.transaction = originalTransaction;
    models.Order.findByPk = originalFind;
    models.Refund.sum = originalSum;
  }
});
