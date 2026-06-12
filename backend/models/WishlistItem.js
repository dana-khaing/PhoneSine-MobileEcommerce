module.exports = (sequelize, DataTypes) => {
  const WishlistItem = sequelize.define("WishlistItem", {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    variantId: { type: DataTypes.INTEGER },
  });
  WishlistItem.associate = ({ Userdetail, Product, ProductVariant }) => {
    WishlistItem.belongsTo(Userdetail, { foreignKey: "userId" });
    WishlistItem.belongsTo(Product, { as: "product", foreignKey: "productId" });
    WishlistItem.belongsTo(ProductVariant, { as: "variant", foreignKey: "variantId" });
  };
  return WishlistItem;
};
