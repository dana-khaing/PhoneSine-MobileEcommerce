module.exports = (sequelize, DataTypes) => {
  const SavedCart = sequelize.define("SavedCart", {
    userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    items: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
  });
  SavedCart.associate = ({ Userdetail }) => SavedCart.belongsTo(Userdetail, { foreignKey: "userId" });
  return SavedCart;
};
