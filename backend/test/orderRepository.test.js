const test = require("node:test");
const assert = require("node:assert/strict");
const models = require("../models");
const { createOrderWithItems, loadCheckoutItems } = require("../src/orderRepository");

test("creates an order and its items in the same transaction", async () => {
  const transaction = { id: "transaction" };
  const originalTransaction = models.sequelize.transaction;
  const originalCreate = models.Order.create;
  const originalBulkCreate = models.OrderItem.bulkCreate;
  const originalFindByPk = models.Product.findByPk;
  const originalFindPromotion = models.Promotion.findOne;
  const originalReservationCreate = models.InventoryReservation.create;
  const originalEventCreate = models.OrderEvent.create;
  const calls = [];

  models.sequelize.transaction = async (callback) => callback(transaction);
  models.Order.create = async (record, options) => {
    calls.push({ type: "order", record, options });
    return { id: 42, ...record };
  };
  models.OrderItem.bulkCreate = async (records, options) => {
    calls.push({ type: "items", records, options });
  };
  models.Product.findByPk = async () => ({
    id: 1,
    name: "Phone",
    priceAmount: 10000,
    stockQuantity: 5,
    reservedQuantity: 0,
    active: true,
    increment: async () => {},
  });
  models.Promotion.findOne = async () => null;
  models.InventoryReservation.create = async () => {};
  models.OrderEvent.create = async () => {};

  try {
    const result = await createOrderWithItems({
      checkout: {
        email: "buyer@example.com",
        address: "1 High Street",
        city: "London",
        postcode: "SW1A 1AA",
        country: "GB",
        deliveryMethod: "standard",
      },
      cartItems: [{ id: 1, quantity: 1 }],
      userId: 7,
    });

    assert.equal(result.order.id, 42);
    assert.equal(calls[0].options.transaction, transaction);
    assert.equal(calls[1].options.transaction, transaction);
    assert.equal(calls[1].records[0].orderId, 42);
    assert.equal(calls[0].record.userId, 7);
  } finally {
    models.sequelize.transaction = originalTransaction;
    models.Order.create = originalCreate;
    models.OrderItem.bulkCreate = originalBulkCreate;
    models.Product.findByPk = originalFindByPk;
    models.Promotion.findOne = originalFindPromotion;
    models.InventoryReservation.create = originalReservationCreate;
    models.OrderEvent.create = originalEventCreate;
  }
});

test("uses a selected variant name and price during checkout", async () => {
  const originalProduct = models.Product.findByPk;
  const originalVariant = models.ProductVariant.findOne;
  models.Product.findByPk = async () => ({ id: 1, name: "Phone", priceAmount: 10000, active: true });
  models.ProductVariant.findOne = async () => ({ id: 7, name: "Blue 256GB", priceAmount: 12000 });
  try {
    const items = await loadCheckoutItems([{ id: 1, variantId: 7, quantity: 1 }], {});
    assert.deepEqual(items[0], {
      productId: 1,
      variantId: 7,
      name: "Phone - Blue 256GB",
      unitAmount: 12000,
      quantity: 1,
    });
  } finally {
    models.Product.findByPk = originalProduct;
    models.ProductVariant.findOne = originalVariant;
  }
});
