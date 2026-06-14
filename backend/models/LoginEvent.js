module.exports = (sequelize, DataTypes) => {
  const LoginEvent = sequelize.define("LoginEvent", {
    userId: { type: DataTypes.INTEGER },
    email: { type: DataTypes.STRING },
    method: { type: DataTypes.STRING, allowNull: false },
    successful: { type: DataTypes.BOOLEAN, allowNull: false },
    ipAddress: { type: DataTypes.STRING },
    userAgent: { type: DataTypes.STRING },
    reason: { type: DataTypes.STRING },
  });

  LoginEvent.associate = ({ Userdetail }) => {
    LoginEvent.belongsTo(Userdetail, { as: "user", foreignKey: "userId" });
  };

  return LoginEvent;
};
