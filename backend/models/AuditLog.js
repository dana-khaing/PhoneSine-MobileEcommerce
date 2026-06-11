module.exports = (sequelize, DataTypes) =>
  sequelize.define("AuditLog", {
    actor: { type: DataTypes.STRING, allowNull: false },
    action: { type: DataTypes.STRING, allowNull: false },
    resourceType: { type: DataTypes.STRING, allowNull: false },
    resourceId: { type: DataTypes.STRING, allowNull: false },
    metadata: { type: DataTypes.JSON },
  });
