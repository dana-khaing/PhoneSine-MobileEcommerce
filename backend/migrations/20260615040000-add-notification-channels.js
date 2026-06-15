"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const columns = await queryInterface.describeTable("Notifications");
    if (!columns.channel) {
      await queryInterface.addColumn("Notifications", "channel", { type: Sequelize.STRING, allowNull: false, defaultValue: "email" });
      await queryInterface.addIndex("Notifications", ["channel", "status", "createdAt"]);
    }
  },
  async down() {
    throw new Error("Notification channel migration is intentionally non-destructive");
  },
};
