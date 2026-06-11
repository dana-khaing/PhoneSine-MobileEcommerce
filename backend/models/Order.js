module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define("Order", {
    userId: { type: DataTypes.INTEGER, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "pending" },
    stripeSessionId: { type: DataTypes.STRING, unique: true },
    totalAmount: { type: DataTypes.INTEGER, allowNull: false },
    subtotalAmount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    taxAmount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    discountAmount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    promotionCode: { type: DataTypes.STRING },
    deliveryMethod: { type: DataTypes.STRING, allowNull: false },
    shippingAddress: { type: DataTypes.JSON, allowNull: false },
    stripeCustomerId: { type: DataTypes.STRING },
    stripePaymentIntentId: { type: DataTypes.STRING },
    refundAmount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    trackingNumber: { type: DataTypes.STRING },
    carrier: { type: DataTypes.STRING },
  });

  Order.associate = ({ OrderItem, Userdetail, OrderEvent }) => {
    Order.hasMany(OrderItem, { as: "items", foreignKey: "orderId" });
    Order.hasMany(OrderEvent, { as: "events", foreignKey: "orderId" });
    Order.belongsTo(Userdetail, { as: "user", foreignKey: "userId" });
  };

  return Order;
};
