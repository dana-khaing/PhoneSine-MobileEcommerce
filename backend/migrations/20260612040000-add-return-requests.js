"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ReturnRequests", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      orderId: { type: Sequelize.INTEGER, allowNull: false, references: { model: "Orders", key: "id" }, onDelete: "CASCADE" },
      userId: { type: Sequelize.INTEGER, allowNull: false, references: { model: "Userdetails", key: "id" }, onDelete: "CASCADE" },
      reason: { type: Sequelize.STRING, allowNull: false },
      details: { type: Sequelize.TEXT },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: "requested" },
      returnTrackingNumber: { type: Sequelize.STRING },
      adminNote: { type: Sequelize.TEXT },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("ReturnRequests", ["orderId"], { unique: true });
  },
  async down() { throw new Error("Return request migration is intentionally non-destructive"); },
};
