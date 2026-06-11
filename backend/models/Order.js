module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define("Order", {
    userId: { type: DataTypes.INTEGER, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "pending" },
    stripeSessionId: { type: DataTypes.STRING, unique: true },
    totalAmount: { type: DataTypes.INTEGER, allowNull: false },
    deliveryMethod: { type: DataTypes.STRING, allowNull: false },
    shippingAddress: { type: DataTypes.JSON, allowNull: false },
  });

  Order.associate = ({ OrderItem, Userdetail }) => {
    Order.hasMany(OrderItem, { as: "items", foreignKey: "orderId" });
    Order.belongsTo(Userdetail, { as: "user", foreignKey: "userId" });
  };

  return Order;
};
