module.exports = (sequelize, DataTypes) =>
  sequelize.define("PromotionUsage", {
    promotionId: { type: DataTypes.INTEGER, allowNull: false },
    orderId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: false },
  });
