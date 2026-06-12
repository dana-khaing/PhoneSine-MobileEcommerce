"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("WishlistItems", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: Sequelize.INTEGER, allowNull: false, references: { model: "Userdetails", key: "id" }, onDelete: "CASCADE" },
      productId: { type: Sequelize.INTEGER, allowNull: false, references: { model: "Products", key: "id" }, onDelete: "CASCADE" },
      variantId: { type: Sequelize.INTEGER, references: { model: "ProductVariants", key: "id" }, onDelete: "CASCADE" },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("WishlistItems", ["userId", "productId", "variantId"], { unique: true });
    await queryInterface.createTable("SavedCarts", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: Sequelize.INTEGER, allowNull: false, unique: true, references: { model: "Userdetails", key: "id" }, onDelete: "CASCADE" },
      items: { type: Sequelize.JSON, allowNull: false, defaultValue: [] },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },
  async down() {
    throw new Error("Wishlist and saved cart migration is intentionally non-destructive");
  },
};
