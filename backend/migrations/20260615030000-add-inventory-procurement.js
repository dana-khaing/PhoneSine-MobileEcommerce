"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Suppliers", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING },
      phone: { type: Sequelize.STRING },
      active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.createTable("Warehouses", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      code: { type: Sequelize.STRING, allowNull: false, unique: true },
      address: { type: Sequelize.JSON, allowNull: false },
      active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.createTable("WarehouseStocks", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      warehouseId: { type: Sequelize.INTEGER, allowNull: false, references: { model: "Warehouses", key: "id" }, onDelete: "CASCADE" },
      productId: { type: Sequelize.INTEGER, allowNull: false, references: { model: "Products", key: "id" }, onDelete: "CASCADE" },
      quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("WarehouseStocks", ["warehouseId", "productId"], { unique: true });
    await queryInterface.createTable("PurchaseOrders", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      supplierId: { type: Sequelize.INTEGER, allowNull: false, references: { model: "Suppliers", key: "id" } },
      warehouseId: { type: Sequelize.INTEGER, allowNull: false, references: { model: "Warehouses", key: "id" } },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: "ordered" },
      expectedAt: { type: Sequelize.DATE },
      receivedAt: { type: Sequelize.DATE },
      totalAmount: { type: Sequelize.INTEGER, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.createTable("PurchaseOrderItems", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      purchaseOrderId: { type: Sequelize.INTEGER, allowNull: false, references: { model: "PurchaseOrders", key: "id" }, onDelete: "CASCADE" },
      productId: { type: Sequelize.INTEGER, allowNull: false, references: { model: "Products", key: "id" } },
      quantity: { type: Sequelize.INTEGER, allowNull: false },
      unitCostAmount: { type: Sequelize.INTEGER, allowNull: false },
      receivedQuantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },
  async down() {
    throw new Error("Inventory procurement migration is intentionally non-destructive");
  },
};
