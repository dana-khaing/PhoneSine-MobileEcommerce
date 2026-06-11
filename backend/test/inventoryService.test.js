const test = require("node:test");
const assert = require("node:assert/strict");
const models = require("../models");
const { reserveInventory, settleReservations } = require("../src/inventoryService");

test("reserves and commits inventory quantities", async () => {
  const originalProduct = models.Product.findByPk;
  const originalReservationCreate = models.InventoryReservation.create;
  const originalReservationFind = models.InventoryReservation.findAll;
  const calls = [];
  const product = {
    name: "Phone",
    active: true,
    stockQuantity: 5,
    reservedQuantity: 0,
    increment: async (field, options) => calls.push(["increment", field, options.by]),
    decrement: async (field, options) => calls.push(["decrement", field, options.by]),
  };
  const reservation = {
    productId: 1,
    quantity: 2,
    update: async (record) => calls.push(["reservation", record.status]),
  };
  models.Product.findByPk = async () => product;
  models.InventoryReservation.create = async () => {};
  models.InventoryReservation.findAll = async () => [reservation];
  try {
    await reserveInventory(10, [{ productId: 1, quantity: 2 }], {}, new Date());
    await settleReservations(10, "commit", {});
    assert.deepEqual(calls, [
      ["increment", "reservedQuantity", 2],
      ["decrement", "reservedQuantity", 2],
      ["decrement", "stockQuantity", 2],
      ["reservation", "committed"],
    ]);
  } finally {
    models.Product.findByPk = originalProduct;
    models.InventoryReservation.create = originalReservationCreate;
    models.InventoryReservation.findAll = originalReservationFind;
  }
});

test("rejects reservations that exceed available stock", async () => {
  const originalProduct = models.Product.findByPk;
  models.Product.findByPk = async () => ({
    name: "Phone",
    active: true,
    stockQuantity: 2,
    reservedQuantity: 2,
  });
  try {
    await assert.rejects(
      reserveInventory(10, [{ productId: 1, quantity: 1 }], {}, new Date()),
      /Insufficient stock/
    );
  } finally {
    models.Product.findByPk = originalProduct;
  }
});
