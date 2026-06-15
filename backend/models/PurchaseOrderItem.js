module.exports = (sequelize, DataTypes) => {
  const PurchaseOrderItem = sequelize.define("PurchaseOrderItem", {
    purchaseOrderId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    unitCostAmount: { type: DataTypes.INTEGER, allowNull: false },
    receivedQuantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  });
  PurchaseOrderItem.associate = ({ Product, PurchaseOrder }) => {
    PurchaseOrderItem.belongsTo(PurchaseOrder, { foreignKey: "purchaseOrderId" });
    PurchaseOrderItem.belongsTo(Product, { as: "product", foreignKey: "productId" });
  };
  return PurchaseOrderItem;
};
