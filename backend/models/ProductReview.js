module.exports = (sequelize, DataTypes) => {
  const ProductReview = sequelize.define("ProductReview", {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    rating: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    body: { type: DataTypes.TEXT, allowNull: false },
    verifiedPurchase: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "pending" },
  });
  ProductReview.associate = ({ Product, Userdetail }) => {
    ProductReview.belongsTo(Product, { foreignKey: "productId" });
    ProductReview.belongsTo(Userdetail, { as: "author", foreignKey: "userId" });
  };
  return ProductReview;
};
