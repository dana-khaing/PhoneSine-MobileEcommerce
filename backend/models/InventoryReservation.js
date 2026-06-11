module.exports = (sequelize, DataTypes) => {
  const InventoryReservation = sequelize.define("InventoryReservation", {
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "reserved" },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
  });

  InventoryReservation.associate = ({ Order, Product }) => {
    InventoryReservation.belongsTo(Order, { foreignKey: "orderId" });
    InventoryReservation.belongsTo(Product, { foreignKey: "productId" });
  };

  return InventoryReservation;
};
