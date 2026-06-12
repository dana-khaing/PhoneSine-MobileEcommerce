module.exports = (sequelize, DataTypes) => {
  const Shipment = sequelize.define("Shipment", {
    orderId: { type: DataTypes.INTEGER, allowNull: false, unique: true }, carrier: { type: DataTypes.STRING, allowNull: false },
    service: { type: DataTypes.STRING, allowNull: false }, trackingNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "label_created" }, labelUrl: { type: DataTypes.STRING },
  });
  Shipment.associate = ({ Order }) => Shipment.belongsTo(Order, { foreignKey: "orderId" });
  return Shipment;
};
