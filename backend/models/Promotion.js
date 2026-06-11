module.exports = (sequelize, DataTypes) =>
  sequelize.define("Promotion", {
    code: { type: DataTypes.STRING, allowNull: false, unique: true },
    percentOff: { type: DataTypes.INTEGER, allowNull: false },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    expiresAt: { type: DataTypes.DATE },
  });
