module.exports = (sequelize, DataTypes) => {
  const ProductVariant = sequelize.define("ProductVariant", {
    productId: { type: DataTypes.INTEGER, allowNull: false },
    sku: { type: DataTypes.STRING, allowNull: false, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    options: { type: DataTypes.JSON, allowNull: false, defaultValue: {} },
    priceAmount: { type: DataTypes.INTEGER, allowNull: false },
    stockQuantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    reservedQuantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  });

  ProductVariant.associate = ({ Product, OrderItem, InventoryReservation }) => {
    ProductVariant.belongsTo(Product, { foreignKey: "productId" });
    ProductVariant.hasMany(OrderItem, { foreignKey: "variantId" });
    ProductVariant.hasMany(InventoryReservation, { foreignKey: "variantId" });
  };

  return ProductVariant;
};
