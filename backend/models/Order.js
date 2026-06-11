module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define("Order", {
    email: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "pending" },
    stripeSessionId: { type: DataTypes.STRING },
    totalAmount: { type: DataTypes.INTEGER, allowNull: false },
    deliveryMethod: { type: DataTypes.STRING, allowNull: false },
    shippingAddress: { type: DataTypes.JSON, allowNull: false },
  });

  Order.associate = ({ OrderItem }) => {
    Order.hasMany(OrderItem, { as: "items", foreignKey: "orderId" });
  };

  return Order;
};
