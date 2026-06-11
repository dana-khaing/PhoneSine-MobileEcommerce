"use strict";

const products = require("../public/productsList.json");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Products", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      brand: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },
      priceAmount: { type: Sequelize.INTEGER, allowNull: false },
      stockQuantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      reservedQuantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    const now = new Date();
    await queryInterface.bulkInsert(
      "Products",
      products.map((product) => ({
        id: product.id,
        name: product.name,
        brand: product.brand,
        description: product.description || null,
        priceAmount: Math.round(product.price * 100),
        stockQuantity: 25,
        reservedQuantity: 0,
        active: true,
        createdAt: now,
        updatedAt: now,
      }))
    );

    await queryInterface.createTable("Promotions", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      code: { type: Sequelize.STRING, allowNull: false, unique: true },
      percentOff: { type: Sequelize.INTEGER, allowNull: false },
      active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      expiresAt: { type: Sequelize.DATE },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.bulkInsert("Promotions", [
      {
        code: "WELCOME10",
        percentOff: 10,
        active: true,
        expiresAt: null,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    await queryInterface.createTable("InventoryReservations", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      orderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Orders", key: "id" },
        onDelete: "CASCADE",
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Products", key: "id" },
      },
      quantity: { type: Sequelize.INTEGER, allowNull: false },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: "reserved" },
      expiresAt: { type: Sequelize.DATE, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("InventoryReservations", ["orderId", "status"]);
    await queryInterface.addIndex("InventoryReservations", ["expiresAt", "status"]);

    await queryInterface.createTable("OrderEvents", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      orderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Orders", key: "id" },
        onDelete: "CASCADE",
      },
      type: { type: Sequelize.STRING, allowNull: false },
      message: { type: Sequelize.STRING, allowNull: false },
      metadata: { type: Sequelize.JSON },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("OrderEvents", ["orderId", "createdAt"]);

    await queryInterface.createTable("Notifications", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      orderId: { type: Sequelize.INTEGER, allowNull: false },
      recipient: { type: Sequelize.STRING, allowNull: false },
      type: { type: Sequelize.STRING, allowNull: false },
      subject: { type: Sequelize.STRING, allowNull: false },
      body: { type: Sequelize.TEXT, allowNull: false },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: "pending" },
      sentAt: { type: Sequelize.DATE },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("Notifications", ["status", "createdAt"]);

    await addColumns(queryInterface, Sequelize, "Orders", {
      subtotalAmount: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      taxAmount: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      discountAmount: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      promotionCode: { type: Sequelize.STRING },
      stripeCustomerId: { type: Sequelize.STRING },
      stripePaymentIntentId: { type: Sequelize.STRING },
      refundAmount: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      trackingNumber: { type: Sequelize.STRING },
      carrier: { type: Sequelize.STRING },
    });
    await addColumns(queryInterface, Sequelize, "Userdetails", {
      stripeCustomerId: { type: Sequelize.STRING },
    });
  },

  async down() {
    throw new Error("Commerce operations migration is intentionally non-destructive");
  },
};

async function addColumns(queryInterface, Sequelize, table, columns) {
  const existing = await queryInterface.describeTable(table);
  for (const [name, definition] of Object.entries(columns)) {
    if (!existing[name]) await queryInterface.addColumn(table, name, definition);
  }
}
