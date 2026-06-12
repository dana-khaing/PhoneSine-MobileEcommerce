"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Categories", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false, unique: true },
      slug: { type: Sequelize.STRING, allowNull: false, unique: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addColumn("Products", "categoryId", {
      type: Sequelize.INTEGER,
      references: { model: "Categories", key: "id" },
      onDelete: "SET NULL",
    });
    await queryInterface.addColumn("Products", "specifications", {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: {},
    });
    await queryInterface.createTable("ProductVariants", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      productId: { type: Sequelize.INTEGER, allowNull: false, references: { model: "Products", key: "id" }, onDelete: "CASCADE" },
      sku: { type: Sequelize.STRING, allowNull: false, unique: true },
      name: { type: Sequelize.STRING, allowNull: false },
      options: { type: Sequelize.JSON, allowNull: false, defaultValue: {} },
      priceAmount: { type: Sequelize.INTEGER, allowNull: false },
      stockQuantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      reservedQuantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addColumn("OrderItems", "variantId", {
      type: Sequelize.INTEGER,
      references: { model: "ProductVariants", key: "id" },
      onDelete: "SET NULL",
    });
    await queryInterface.addColumn("InventoryReservations", "variantId", {
      type: Sequelize.INTEGER,
      references: { model: "ProductVariants", key: "id" },
      onDelete: "SET NULL",
    });
    await queryInterface.addIndex("Products", ["categoryId"]);
    await queryInterface.addIndex("ProductVariants", ["productId", "active"]);
  },
  async down() {
    throw new Error("Product categories and variants migration is intentionally non-destructive");
  },
};
