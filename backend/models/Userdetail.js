module.exports = (sequelize, DataTypes) => {
  const Userdetail = sequelize.define("Userdetail", {
    firstname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stripeCustomerId: {
      type: DataTypes.STRING,
    },
    emailVerifiedAt: {
      type: DataTypes.DATE,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "customer",
    },
  });

  Userdetail.associate = ({ Order, SavedCart, WishlistItem }) => {
    Userdetail.hasMany(Order, { as: "orders", foreignKey: "userId" });
    Userdetail.hasOne(SavedCart, { as: "savedCart", foreignKey: "userId" });
    Userdetail.hasMany(WishlistItem, { as: "wishlist", foreignKey: "userId" });
  };

  return Userdetail;
};
