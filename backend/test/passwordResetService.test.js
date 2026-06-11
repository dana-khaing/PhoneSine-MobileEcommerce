const test = require("node:test");
const assert = require("node:assert/strict");
const models = require("../models");
const { resetPassword } = require("../src/passwordResetService");

test("rejects weak replacement passwords before consuming reset tokens", async () => {
  await assert.rejects(() => resetPassword("token", "weak"), /Password must/);
});

test("resets a password and consumes the token", async () => {
  const originals = {
    transaction: models.sequelize.transaction,
    findOne: models.PasswordResetToken.findOne,
    findByPk: models.Userdetail.findByPk,
  };
  const updates = [];
  models.sequelize.transaction = async (callback) => callback({ LOCK: { UPDATE: "UPDATE" } });
  models.PasswordResetToken.findOne = async () => ({ userId: 1, update: async (value) => updates.push(value) });
  models.Userdetail.findByPk = async () => ({ update: async (value) => updates.push(value) });
  try {
    await resetPassword("token", "NewPassword1!");
    assert.notEqual(updates[0].password, "NewPassword1!");
    assert.ok(updates[1].usedAt instanceof Date);
  } finally {
    models.sequelize.transaction = originals.transaction;
    models.PasswordResetToken.findOne = originals.findOne;
    models.Userdetail.findByPk = originals.findByPk;
  }
});
