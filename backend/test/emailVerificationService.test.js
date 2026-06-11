const test = require("node:test");
const assert = require("node:assert/strict");
const models = require("../models");
const { verifyEmailToken } = require("../src/emailVerificationService");

test("verifies a valid email token exactly once", async () => {
  const originals = {
    transaction: models.sequelize.transaction,
    findOne: models.EmailVerificationToken.findOne,
    findByPk: models.Userdetail.findByPk,
  };
  const updates = [];
  models.sequelize.transaction = async (callback) => callback({ LOCK: { UPDATE: "UPDATE" } });
  models.EmailVerificationToken.findOne = async () => ({ userId: 1, update: async (value) => updates.push(value) });
  models.Userdetail.findByPk = async () => ({ update: async (value) => updates.push(value) });
  try {
    await verifyEmailToken("valid-token");
    assert.ok(updates[0].emailVerifiedAt instanceof Date);
    assert.ok(updates[1].usedAt instanceof Date);
  } finally {
    models.sequelize.transaction = originals.transaction;
    models.EmailVerificationToken.findOne = originals.findOne;
    models.Userdetail.findByPk = originals.findByPk;
  }
});
