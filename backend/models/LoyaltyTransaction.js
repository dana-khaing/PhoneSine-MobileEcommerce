module.exports = (sequelize, DataTypes) => {
  const LoyaltyTransaction = sequelize.define("LoyaltyTransaction", {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    orderId: { type: DataTypes.INTEGER },
    type: { type: DataTypes.STRING, allowNull: false },
    points: { type: DataTypes.INTEGER, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: false },
  });
  LoyaltyTransaction.associate = ({ Order, Userdetail }) => {
    LoyaltyTransaction.belongsTo(Userdetail, { as: "user", foreignKey: "userId" });
    LoyaltyTransaction.belongsTo(Order, { as: "order", foreignKey: "orderId" });
  };
  return LoyaltyTransaction;
};
