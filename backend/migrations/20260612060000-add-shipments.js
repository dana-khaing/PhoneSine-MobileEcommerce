"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Shipments", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      orderId: { type: Sequelize.INTEGER, allowNull: false, unique: true, references: { model: "Orders", key: "id" }, onDelete: "CASCADE" },
      carrier: { type: Sequelize.STRING, allowNull: false },
      service: { type: Sequelize.STRING, allowNull: false },
      trackingNumber: { type: Sequelize.STRING, allowNull: false, unique: true },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: "label_created" },
      labelUrl: { type: Sequelize.STRING },
      createdAt: { type: Sequelize.DATE, allowNull: false }, updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },
  async down() { throw new Error("Shipment migration is intentionally non-destructive"); },
};
