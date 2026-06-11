module.exports = (sequelize, DataTypes) =>
  sequelize.define("RefreshSession", {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    tokenHash: { type: DataTypes.STRING, allowNull: false, unique: true },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
    revokedAt: { type: DataTypes.DATE },
    userAgent: { type: DataTypes.STRING },
  });
