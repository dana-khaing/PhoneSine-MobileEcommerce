"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Products", "allowBackorder", { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false });
    await queryInterface.addColumn("Products", "preorderDate", { type: Sequelize.DATE });
    await queryInterface.createTable("ProductBundles", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true }, name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT }, priceAmount: { type: Sequelize.INTEGER, allowNull: false }, items: { type: Sequelize.JSON, allowNull: false },
      active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true }, createdAt: { type: Sequelize.DATE, allowNull: false }, updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },
  async down() { throw new Error("Advanced catalogue migration is intentionally non-destructive"); },
};
