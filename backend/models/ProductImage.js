module.exports = (sequelize, DataTypes) => {
  const ProductImage = sequelize.define("ProductImage", {
    productId: { type: DataTypes.INTEGER, allowNull: false },
    url: { type: DataTypes.STRING, allowNull: false },
    altText: { type: DataTypes.STRING, allowNull: false },
    position: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  });
  ProductImage.associate = ({ Product }) => {
    ProductImage.belongsTo(Product, { foreignKey: "productId" });
  };
  return ProductImage;
};
