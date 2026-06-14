"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("LoyaltyAccounts", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      userId: { type: Sequelize.INTEGER, allowNull: false, unique: true, references: { model: "Userdetails", key: "id" }, onDelete: "CASCADE" },
      pointsBalance: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      referralCode: { type: Sequelize.STRING, allowNull: false, unique: true },
      referredByUserId: { type: Sequelize.INTEGER, references: { model: "Userdetails", key: "id" }, onDelete: "SET NULL" },
      referralRewardedAt: { type: Sequelize.DATE },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.createTable("LoyaltyTransactions", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      userId: { type: Sequelize.INTEGER, allowNull: false, references: { model: "Userdetails", key: "id" }, onDelete: "CASCADE" },
      orderId: { type: Sequelize.INTEGER, references: { model: "Orders", key: "id" }, onDelete: "SET NULL" },
      type: { type: Sequelize.STRING, allowNull: false },
      points: { type: Sequelize.INTEGER, allowNull: false },
      description: { type: Sequelize.STRING, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("LoyaltyTransactions", ["userId", "orderId", "type"], { unique: true, name: "loyalty_transaction_once" });
  },
  async down() {
    throw new Error("Loyalty rewards migration is intentionally non-destructive");
  },
};
