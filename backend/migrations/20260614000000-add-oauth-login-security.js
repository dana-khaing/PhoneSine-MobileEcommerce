"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("OAuthIdentities", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      userId: { type: Sequelize.INTEGER, allowNull: false, references: { model: "Userdetails", key: "id" }, onDelete: "CASCADE" },
      provider: { type: Sequelize.STRING, allowNull: false },
      subject: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("OAuthIdentities", ["provider", "subject"], { unique: true });
    await queryInterface.addIndex("OAuthIdentities", ["userId", "provider"], { unique: true });

    await queryInterface.createTable("LoginEvents", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      userId: { type: Sequelize.INTEGER, references: { model: "Userdetails", key: "id" }, onDelete: "SET NULL" },
      email: { type: Sequelize.STRING },
      method: { type: Sequelize.STRING, allowNull: false },
      successful: { type: Sequelize.BOOLEAN, allowNull: false },
      ipAddress: { type: Sequelize.STRING },
      userAgent: { type: Sequelize.STRING },
      reason: { type: Sequelize.STRING },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("LoginEvents", ["userId", "createdAt"]);
    await queryInterface.addIndex("LoginEvents", ["email", "createdAt"]);
  },

  async down() {
    throw new Error("OAuth login security migration is intentionally non-destructive");
  },
};
