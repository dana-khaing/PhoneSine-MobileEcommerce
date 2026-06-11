"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await queryInterface.describeTable("Userdetails");
    if (!users.emailVerifiedAt) {
      await queryInterface.addColumn("Userdetails", "emailVerifiedAt", {
        type: Sequelize.DATE,
      });
    }
    await queryInterface.createTable("EmailVerificationTokens", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Userdetails", key: "id" },
        onDelete: "CASCADE",
      },
      tokenHash: { type: Sequelize.STRING, allowNull: false, unique: true },
      expiresAt: { type: Sequelize.DATE, allowNull: false },
      usedAt: { type: Sequelize.DATE },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("EmailVerificationTokens", ["userId", "usedAt"]);
  },

  async down() {
    throw new Error("Email verification migration is intentionally non-destructive");
  },
};
