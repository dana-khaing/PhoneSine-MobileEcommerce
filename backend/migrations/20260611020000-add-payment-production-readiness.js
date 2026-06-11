"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await addColumns(queryInterface, Sequelize, "Orders", {
      currency: { type: Sequelize.STRING, allowNull: false, defaultValue: "gbp" },
      idempotencyKey: { type: Sequelize.STRING, unique: true },
      disputeId: { type: Sequelize.STRING },
      disputeStatus: { type: Sequelize.STRING },
      reconciledAt: { type: Sequelize.DATE },
    });
    await addColumns(queryInterface, Sequelize, "Promotions", {
      maxUses: { type: Sequelize.INTEGER },
      useCount: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      perCustomerLimit: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
    });

    await queryInterface.createTable("Refunds", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      orderId: { type: Sequelize.INTEGER, allowNull: false, references: { model: "Orders", key: "id" } },
      stripeRefundId: { type: Sequelize.STRING, allowNull: false, unique: true },
      amount: { type: Sequelize.INTEGER, allowNull: false },
      currency: { type: Sequelize.STRING, allowNull: false, defaultValue: "gbp" },
      status: { type: Sequelize.STRING, allowNull: false },
      requestedBy: { type: Sequelize.STRING, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("Refunds", ["orderId", "status"]);

    await queryInterface.createTable("AuditLogs", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      actor: { type: Sequelize.STRING, allowNull: false },
      action: { type: Sequelize.STRING, allowNull: false },
      resourceType: { type: Sequelize.STRING, allowNull: false },
      resourceId: { type: Sequelize.STRING, allowNull: false },
      metadata: { type: Sequelize.JSON },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("AuditLogs", ["resourceType", "resourceId"]);

    await queryInterface.createTable("PromotionUsages", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      promotionId: { type: Sequelize.INTEGER, allowNull: false, references: { model: "Promotions", key: "id" } },
      orderId: { type: Sequelize.INTEGER, allowNull: false, unique: true, references: { model: "Orders", key: "id" } },
      email: { type: Sequelize.STRING, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("PromotionUsages", ["promotionId", "email"]);
  },

  async down() {
    throw new Error("Payment production readiness migration is intentionally non-destructive");
  },
};

async function addColumns(queryInterface, Sequelize, table, columns) {
  const existing = await queryInterface.describeTable(table);
  for (const [name, definition] of Object.entries(columns)) {
    if (!existing[name]) await queryInterface.addColumn(table, name, definition);
  }
}
