module.exports = (sequelize, DataTypes) => {
  const Warehouse = sequelize.define("Warehouse", {
    name: { type: DataTypes.STRING, allowNull: false },
    code: { type: DataTypes.STRING, allowNull: false, unique: true },
    address: { type: DataTypes.JSON, allowNull: false },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  });
  Warehouse.associate = ({ WarehouseStock }) => Warehouse.hasMany(WarehouseStock, { as: "stocks", foreignKey: "warehouseId" });
  return Warehouse;
};
