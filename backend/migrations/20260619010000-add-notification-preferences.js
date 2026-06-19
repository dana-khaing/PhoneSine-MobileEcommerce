"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const columns = await queryInterface.describeTable("Userdetails");
    if (!columns.notificationPreferences) {
      await queryInterface.addColumn("Userdetails", "notificationPreferences", {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {
          email: true,
          sms: false,
          orderUpdates: true,
          promotions: false,
          security: true,
        },
      });
    }
  },
  async down() {
    throw new Error("Notification preferences migration is intentionally non-destructive");
  },
};
