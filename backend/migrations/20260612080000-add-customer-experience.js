"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("SupportTickets", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true }, userId: { type: Sequelize.INTEGER, allowNull: false, references: { model: "Userdetails", key: "id" }, onDelete: "CASCADE" },
      subject: { type: Sequelize.STRING, allowNull: false }, message: { type: Sequelize.TEXT, allowNull: false }, status: { type: Sequelize.STRING, allowNull: false, defaultValue: "open" },
      adminReply: { type: Sequelize.TEXT }, createdAt: { type: Sequelize.DATE, allowNull: false }, updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.createTable("GiftCards", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true }, code: { type: Sequelize.STRING, allowNull: false, unique: true },
      balanceAmount: { type: Sequelize.INTEGER, allowNull: false }, currency: { type: Sequelize.STRING, allowNull: false, defaultValue: "gbp" },
      active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true }, expiresAt: { type: Sequelize.DATE }, createdAt: { type: Sequelize.DATE, allowNull: false }, updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },
  async down() { throw new Error("Customer experience migration is intentionally non-destructive"); },
};
