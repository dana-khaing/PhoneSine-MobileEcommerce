module.exports = (sequelize, DataTypes) => sequelize.define("ProductBundle", {
  name: { type: DataTypes.STRING, allowNull: false }, description: { type: DataTypes.TEXT }, priceAmount: { type: DataTypes.INTEGER, allowNull: false },
  items: { type: DataTypes.JSON, allowNull: false }, active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
});
