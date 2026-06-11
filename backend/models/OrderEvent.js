module.exports = (sequelize, DataTypes) => {
  const OrderEvent = sequelize.define("OrderEvent", {
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.STRING, allowNull: false },
    metadata: { type: DataTypes.JSON },
  });

  OrderEvent.associate = ({ Order }) => {
    OrderEvent.belongsTo(Order, { foreignKey: "orderId" });
  };

  return OrderEvent;
};
