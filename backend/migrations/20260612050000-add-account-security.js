"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Userdetails", "failedLoginAttempts", { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 });
    await queryInterface.addColumn("Userdetails", "lockedUntil", { type: Sequelize.DATE });
    await queryInterface.addColumn("Userdetails", "twoFactorSecret", { type: Sequelize.STRING });
    await queryInterface.addColumn("Userdetails", "twoFactorEnabled", { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false });
  },
  async down() { throw new Error("Account security migration is intentionally non-destructive"); },
};
