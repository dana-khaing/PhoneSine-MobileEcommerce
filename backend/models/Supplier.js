module.exports = (sequelize, DataTypes) =>
  sequelize.define("Supplier", {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  });
