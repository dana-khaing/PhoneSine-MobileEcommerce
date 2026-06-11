"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await queryInterface.describeTable("Userdetails");
    if (!users.role) {
      await queryInterface.addColumn("Userdetails", "role", {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "customer",
      });
    }
    const configuredAdmins = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);
    if (configuredAdmins.length) {
      await queryInterface.bulkUpdate("Userdetails", { role: "admin" }, { email: configuredAdmins });
    }
  },
  async down() {
    throw new Error("User role migration is intentionally non-destructive");
  },
};
