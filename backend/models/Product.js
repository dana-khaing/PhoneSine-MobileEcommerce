module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define("Product", {
    name: { type: DataTypes.STRING, allowNull: false },
    brand: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    priceAmount: { type: DataTypes.INTEGER, allowNull: false },
    stockQuantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    reservedQuantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    categoryId: { type: DataTypes.INTEGER },
    specifications: { type: DataTypes.JSON, allowNull: false, defaultValue: {} },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  });

  Product.associate = ({ Category, OrderItem, ProductImage, ProductReview, ProductVariant }) => {
    Product.belongsTo(Category, { as: "category", foreignKey: "categoryId" });
    Product.hasMany(OrderItem, { foreignKey: "productId" });
    Product.hasMany(ProductImage, { as: "images", foreignKey: "productId" });
    Product.hasMany(ProductVariant, { as: "variants", foreignKey: "productId" });
    Product.hasMany(ProductReview, { as: "reviews", foreignKey: "productId" });
  };

  return Product;
};
