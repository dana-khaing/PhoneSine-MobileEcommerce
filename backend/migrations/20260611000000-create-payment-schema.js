"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableNames = new Set(
      (await queryInterface.showAllTables()).map((table) =>
        typeof table === "string" ? table : table.tableName
      )
    );

    if (!tableNames.has("Userdetails")) {
      await queryInterface.createTable("Userdetails", {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        firstname: { type: Sequelize.STRING, allowNull: false },
        lastname: { type: Sequelize.STRING, allowNull: false },
        email: { type: Sequelize.STRING, allowNull: false },
        password: { type: Sequelize.STRING, allowNull: false },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      });
    }
    await addIndexUnlessPresent(queryInterface, "Userdetails", ["email"], {
      name: "userdetails_email_unique",
      unique: true,
    });

    if (!tableNames.has("Orders")) {
      await queryInterface.createTable("Orders", {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: "Userdetails", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        email: { type: Sequelize.STRING, allowNull: false },
        status: { type: Sequelize.STRING, allowNull: false, defaultValue: "pending" },
        stripeSessionId: { type: Sequelize.STRING, allowNull: true },
        totalAmount: { type: Sequelize.INTEGER, allowNull: false },
        deliveryMethod: { type: Sequelize.STRING, allowNull: false },
        shippingAddress: { type: Sequelize.JSON, allowNull: false },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      });
    } else {
      const orders = await queryInterface.describeTable("Orders");
      if (!orders.userId) {
        await queryInterface.addColumn("Orders", "userId", {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: "Userdetails", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        });
      }
    }
    await addIndexUnlessPresent(queryInterface, "Orders", ["userId"], {
      name: "orders_user_id",
    });
    await addIndexUnlessPresent(queryInterface, "Orders", ["email"], {
      name: "orders_email",
    });
    await addIndexUnlessPresent(queryInterface, "Orders", ["stripeSessionId"], {
      name: "orders_stripe_session_unique",
      unique: true,
    });

    if (!tableNames.has("OrderItems")) {
      await queryInterface.createTable("OrderItems", {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        orderId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: "Orders", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        productId: { type: Sequelize.INTEGER, allowNull: false },
        name: { type: Sequelize.STRING, allowNull: false },
        unitAmount: { type: Sequelize.INTEGER, allowNull: false },
        quantity: { type: Sequelize.INTEGER, allowNull: false },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      });
    }
    await addIndexUnlessPresent(queryInterface, "OrderItems", ["orderId"], {
      name: "order_items_order_id",
    });

    if (!tableNames.has("StripeEvents")) {
      await queryInterface.createTable("StripeEvents", {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        eventId: { type: Sequelize.STRING, allowNull: false },
        type: { type: Sequelize.STRING, allowNull: false },
        processedAt: { type: Sequelize.DATE, allowNull: false },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      });
    }
    await addIndexUnlessPresent(queryInterface, "StripeEvents", ["eventId"], {
      name: "stripe_events_event_id_unique",
      unique: true,
    });
  },

  async down() {
    throw new Error(
      "Initial schema adoption cannot be rolled back automatically without risking existing data"
    );
  },
};

async function addIndexUnlessPresent(queryInterface, table, fields, options) {
  const indexes = await queryInterface.showIndex(table);
  const exists = indexes.some(
    (index) =>
      index.unique === Boolean(options.unique) &&
      fields.every((field) =>
        index.fields.some((indexedField) => indexedField.attribute === field)
      )
  );

  if (!exists) {
    await queryInterface.addIndex(table, fields, options);
  }
}
