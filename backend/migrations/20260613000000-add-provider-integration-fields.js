"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Orders", "giftCardCode", { type: Sequelize.STRING });
    await queryInterface.addColumn("Orders", "giftCardAmount", { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 });
    await queryInterface.addColumn("Userdetails", "twoFactorRecoveryCodes", { type: Sequelize.JSON, allowNull: false, defaultValue: [] });
  },
  async down() { throw new Error("Provider integration migration is intentionally non-destructive"); },
};
