module.exports = (sequelize, DataTypes) => {
  const LoyaltyAccount = sequelize.define("LoyaltyAccount", {
    userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    pointsBalance: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    referralCode: { type: DataTypes.STRING, allowNull: false, unique: true },
    referredByUserId: { type: DataTypes.INTEGER },
    referralRewardedAt: { type: DataTypes.DATE },
  });
  LoyaltyAccount.associate = ({ Userdetail }) => {
    LoyaltyAccount.belongsTo(Userdetail, { as: "user", foreignKey: "userId" });
    LoyaltyAccount.belongsTo(Userdetail, { as: "referrer", foreignKey: "referredByUserId" });
  };
  return LoyaltyAccount;
};
