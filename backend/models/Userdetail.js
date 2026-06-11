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
  });

  Userdetail.associate = ({ Order }) => {
    Userdetail.hasMany(Order, { as: "orders", foreignKey: "userId" });
  };

  return Userdetail;
};
