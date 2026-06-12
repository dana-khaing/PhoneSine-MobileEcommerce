module.exports = (sequelize, DataTypes) => {
  const InventoryReservation = sequelize.define("InventoryReservation", {
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    variantId: { type: DataTypes.INTEGER },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "reserved" },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
  });

  InventoryReservation.associate = ({ Order, Product, ProductVariant }) => {
    InventoryReservation.belongsTo(Order, { foreignKey: "orderId" });
    InventoryReservation.belongsTo(Product, { foreignKey: "productId" });
    InventoryReservation.belongsTo(ProductVariant, { foreignKey: "variantId" });
  };

  return InventoryReservation;
};
