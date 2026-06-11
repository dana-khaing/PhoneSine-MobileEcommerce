module.exports = (sequelize, DataTypes) =>
  sequelize.define("Notification", {
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    recipient: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false },
    subject: { type: DataTypes.STRING, allowNull: false },
    body: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "pending" },
    sentAt: { type: DataTypes.DATE },
  });
