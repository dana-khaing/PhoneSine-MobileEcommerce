module.exports = (sequelize, DataTypes) => sequelize.define("GiftCard", {
  code: { type: DataTypes.STRING, allowNull: false, unique: true }, balanceAmount: { type: DataTypes.INTEGER, allowNull: false },
  currency: { type: DataTypes.STRING, allowNull: false, defaultValue: "gbp" }, active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }, expiresAt: { type: DataTypes.DATE },
});
