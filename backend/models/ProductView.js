module.exports = (sequelize, DataTypes) => {
  const ProductView = sequelize.define("ProductView", {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    viewCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    lastViewedAt: { type: DataTypes.DATE, allowNull: false },
  });
  ProductView.associate = ({ Product, Userdetail }) => {
    ProductView.belongsTo(Product, { as: "product", foreignKey: "productId" });
    ProductView.belongsTo(Userdetail, { as: "user", foreignKey: "userId" });
  };
  return ProductView;
};
