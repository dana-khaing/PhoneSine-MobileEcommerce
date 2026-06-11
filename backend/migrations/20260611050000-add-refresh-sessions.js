"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("RefreshSessions", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: Sequelize.INTEGER, allowNull: false, references: { model: "Userdetails", key: "id" }, onDelete: "CASCADE" },
      tokenHash: { type: Sequelize.STRING, allowNull: false, unique: true },
      expiresAt: { type: Sequelize.DATE, allowNull: false },
      revokedAt: { type: Sequelize.DATE },
      userAgent: { type: Sequelize.STRING },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("RefreshSessions", ["userId", "revokedAt"]);
  },
  async down() {
    throw new Error("Refresh session migration is intentionally non-destructive");
  },
};
