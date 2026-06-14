"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("CustomerAddresses", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      userId: { type: Sequelize.INTEGER, allowNull: false, references: { model: "Userdetails", key: "id" }, onDelete: "CASCADE" },
      label: { type: Sequelize.STRING, allowNull: false },
      recipientName: { type: Sequelize.STRING, allowNull: false },
      line1: { type: Sequelize.STRING, allowNull: false },
      line2: { type: Sequelize.STRING },
      city: { type: Sequelize.STRING, allowNull: false },
      region: { type: Sequelize.STRING },
      postalCode: { type: Sequelize.STRING, allowNull: false },
      country: { type: Sequelize.STRING, allowNull: false },
      phone: { type: Sequelize.STRING },
      isDefault: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("CustomerAddresses", ["userId", "isDefault"]);
  },
  async down() {
    throw new Error("Customer address migration is intentionally non-destructive");
  },
};
