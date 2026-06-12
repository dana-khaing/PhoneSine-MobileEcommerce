module.exports = (sequelize, DataTypes) => {
  const ReturnRequest = sequelize.define("ReturnRequest", {
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    reason: { type: DataTypes.STRING, allowNull: false },
    details: { type: DataTypes.TEXT },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "requested" },
    returnTrackingNumber: { type: DataTypes.STRING },
    adminNote: { type: DataTypes.TEXT },
  });
  ReturnRequest.associate = ({ Order, Userdetail }) => {
    ReturnRequest.belongsTo(Order, { foreignKey: "orderId" });
    ReturnRequest.belongsTo(Userdetail, { foreignKey: "userId" });
  };
  return ReturnRequest;
};
