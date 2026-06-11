module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define("Product", {
    name: { type: DataTypes.STRING, allowNull: false },
    brand: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    priceAmount: { type: DataTypes.INTEGER, allowNull: false },
    stockQuantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    reservedQuantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  });

  Product.associate = ({ OrderItem }) => {
    Product.hasMany(OrderItem, { foreignKey: "productId" });
  };

  return Product;
};
