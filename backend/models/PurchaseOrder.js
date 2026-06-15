module.exports = (sequelize, DataTypes) => {
  const PurchaseOrder = sequelize.define("PurchaseOrder", {
    supplierId: { type: DataTypes.INTEGER, allowNull: false },
    warehouseId: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "ordered" },
    expectedAt: { type: DataTypes.DATE },
    receivedAt: { type: DataTypes.DATE },
    totalAmount: { type: DataTypes.INTEGER, allowNull: false },
  });
  PurchaseOrder.associate = ({ PurchaseOrderItem, Supplier, Warehouse }) => {
    PurchaseOrder.belongsTo(Supplier, { as: "supplier", foreignKey: "supplierId" });
    PurchaseOrder.belongsTo(Warehouse, { as: "warehouse", foreignKey: "warehouseId" });
    PurchaseOrder.hasMany(PurchaseOrderItem, { as: "items", foreignKey: "purchaseOrderId" });
  };
  return PurchaseOrder;
};
