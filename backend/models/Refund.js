module.exports = (sequelize, DataTypes) => {
  const Refund = sequelize.define("Refund", {
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    stripeRefundId: { type: DataTypes.STRING, allowNull: false, unique: true },
    amount: { type: DataTypes.INTEGER, allowNull: false },
    currency: { type: DataTypes.STRING, allowNull: false, defaultValue: "gbp" },
    status: { type: DataTypes.STRING, allowNull: false },
    requestedBy: { type: DataTypes.STRING, allowNull: false },
  });

  Refund.associate = ({ Order }) => {
    Refund.belongsTo(Order, { foreignKey: "orderId" });
  };

  return Refund;
};
