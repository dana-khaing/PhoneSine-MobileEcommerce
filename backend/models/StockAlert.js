module.exports = (sequelize, DataTypes) => {
  const StockAlert = sequelize.define("StockAlert", {
    productId: { type: DataTypes.INTEGER, allowNull: false },
    variantId: { type: DataTypes.INTEGER },
    email: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "pending" },
    notifiedAt: { type: DataTypes.DATE },
  });
  StockAlert.associate = ({ Product, ProductVariant }) => {
    StockAlert.belongsTo(Product, { as: "product", foreignKey: "productId" });
    StockAlert.belongsTo(ProductVariant, { as: "variant", foreignKey: "variantId" });
  };
  return StockAlert;
};
