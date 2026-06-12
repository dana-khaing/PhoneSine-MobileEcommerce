"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ProductReviews", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: Sequelize.INTEGER, allowNull: false, references: { model: "Userdetails", key: "id" }, onDelete: "CASCADE" },
      productId: { type: Sequelize.INTEGER, allowNull: false, references: { model: "Products", key: "id" }, onDelete: "CASCADE" },
      rating: { type: Sequelize.INTEGER, allowNull: false },
      title: { type: Sequelize.STRING, allowNull: false },
      body: { type: Sequelize.TEXT, allowNull: false },
      verifiedPurchase: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: "pending" },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("ProductReviews", ["userId", "productId"], { unique: true });
  },
  async down() { throw new Error("Product review migration is intentionally non-destructive"); },
};
