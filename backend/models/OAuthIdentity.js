module.exports = (sequelize, DataTypes) => {
  const OAuthIdentity = sequelize.define("OAuthIdentity", {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    provider: { type: DataTypes.STRING, allowNull: false },
    subject: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING },
  });

  OAuthIdentity.associate = ({ Userdetail }) => {
    OAuthIdentity.belongsTo(Userdetail, { as: "user", foreignKey: "userId" });
  };

  return OAuthIdentity;
};
