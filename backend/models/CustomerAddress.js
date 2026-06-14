module.exports = (sequelize, DataTypes) => {
  const CustomerAddress = sequelize.define("CustomerAddress", {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    label: { type: DataTypes.STRING, allowNull: false },
    recipientName: { type: DataTypes.STRING, allowNull: false },
    line1: { type: DataTypes.STRING, allowNull: false },
    line2: { type: DataTypes.STRING },
    city: { type: DataTypes.STRING, allowNull: false },
    region: { type: DataTypes.STRING },
    postalCode: { type: DataTypes.STRING, allowNull: false },
    country: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING },
    isDefault: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  });
  CustomerAddress.associate = ({ Userdetail }) => {
    CustomerAddress.belongsTo(Userdetail, { as: "user", foreignKey: "userId" });
  };
  return CustomerAddress;
};
