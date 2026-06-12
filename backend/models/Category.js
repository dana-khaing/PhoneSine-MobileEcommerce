module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define("Category", {
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  });

  Category.associate = ({ Product }) => {
    Category.hasMany(Product, { as: "products", foreignKey: "categoryId" });
  };

  return Category;
};
