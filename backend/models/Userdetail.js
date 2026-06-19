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
    failedLoginAttempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    lockedUntil: { type: DataTypes.DATE },
    twoFactorSecret: { type: DataTypes.STRING },
    twoFactorEnabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    twoFactorRecoveryCodes: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    notificationPreferences: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: { email: true, sms: false, orderUpdates: true, promotions: false, security: true },
    },
  });

  Userdetail.associate = ({ CustomerAddress, LoginEvent, OAuthIdentity, Order, SavedCart, WishlistItem }) => {
    Userdetail.hasMany(CustomerAddress, { as: "addresses", foreignKey: "userId" });
    Userdetail.hasMany(Order, { as: "orders", foreignKey: "userId" });
    Userdetail.hasMany(OAuthIdentity, { as: "oauthIdentities", foreignKey: "userId" });
    Userdetail.hasMany(LoginEvent, { as: "loginEvents", foreignKey: "userId" });
    Userdetail.hasOne(SavedCart, { as: "savedCart", foreignKey: "userId" });
    Userdetail.hasMany(WishlistItem, { as: "wishlist", foreignKey: "userId" });
  };

  return Userdetail;
};
