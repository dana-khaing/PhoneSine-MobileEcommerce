module.exports = (sequelize, DataTypes) => {
  const WarehouseStock = sequelize.define("WarehouseStock", {
    warehouseId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  });
  WarehouseStock.associate = ({ Product, Warehouse }) => {
    WarehouseStock.belongsTo(Warehouse, { as: "warehouse", foreignKey: "warehouseId" });
    WarehouseStock.belongsTo(Product, { as: "product", foreignKey: "productId" });
  };
  return WarehouseStock;
};
