"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ProductViews", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      userId: { type: Sequelize.INTEGER, allowNull: false, references: { model: "Userdetails", key: "id" }, onDelete: "CASCADE" },
      productId: { type: Sequelize.INTEGER, allowNull: false, references: { model: "Products", key: "id" }, onDelete: "CASCADE" },
      viewCount: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      lastViewedAt: { type: Sequelize.DATE, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("ProductViews", ["userId", "productId"], { unique: true });
    await queryInterface.addIndex("ProductViews", ["userId", "lastViewedAt"]);
  },
  async down() {
    throw new Error("Product view migration is intentionally non-destructive");
  },
};
