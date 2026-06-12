module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define("OrderItem", {
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    variantId: { type: DataTypes.INTEGER },
    name: { type: DataTypes.STRING, allowNull: false },
    unitAmount: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
  });

  OrderItem.associate = ({ Order, Product, ProductVariant }) => {
    OrderItem.belongsTo(Order, { foreignKey: "orderId" });
    OrderItem.belongsTo(Product, { foreignKey: "productId" });
    OrderItem.belongsTo(ProductVariant, { foreignKey: "variantId" });
  };

  return OrderItem;
};
