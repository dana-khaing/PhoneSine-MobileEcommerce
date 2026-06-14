"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("StockAlerts", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      productId: { type: Sequelize.INTEGER, allowNull: false, references: { model: "Products", key: "id" }, onDelete: "CASCADE" },
      variantId: { type: Sequelize.INTEGER, references: { model: "ProductVariants", key: "id" }, onDelete: "CASCADE" },
      email: { type: Sequelize.STRING, allowNull: false },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: "pending" },
      notifiedAt: { type: Sequelize.DATE },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("StockAlerts", ["email", "productId", "variantId", "status"], { unique: true, name: "stock_alert_subscription" });
  },
  async down() {
    throw new Error("Stock alert migration is intentionally non-destructive");
  },
};
