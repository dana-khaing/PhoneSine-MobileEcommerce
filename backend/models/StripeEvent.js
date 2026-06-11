module.exports = (sequelize, DataTypes) => {
  return sequelize.define("StripeEvent", {
    eventId: { type: DataTypes.STRING, allowNull: false, unique: true },
    type: { type: DataTypes.STRING, allowNull: false },
    processedAt: { type: DataTypes.DATE, allowNull: false },
  });
};
