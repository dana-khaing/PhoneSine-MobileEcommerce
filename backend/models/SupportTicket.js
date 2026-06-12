module.exports = (sequelize, DataTypes) => sequelize.define("SupportTicket", {
  userId: { type: DataTypes.INTEGER, allowNull: false }, subject: { type: DataTypes.STRING, allowNull: false }, message: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: "open" }, adminReply: { type: DataTypes.TEXT },
});
