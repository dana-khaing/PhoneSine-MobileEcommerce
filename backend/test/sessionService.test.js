const test = require("node:test");
const assert = require("node:assert/strict");
const models = require("../models");
const { rotateSession } = require("../src/sessionService");

test("rotates refresh tokens and revokes the previous session", async () => {
  const originals = {
    transaction: models.sequelize.transaction,
    findOne: models.RefreshSession.findOne,
    findByPk: models.Userdetail.findByPk,
    create: models.RefreshSession.create,
  };
  const session = { userId: 1, expiresAt: new Date(Date.now() + 10000), update: async (value) => Object.assign(session, value) };
  models.sequelize.transaction = async (callback) => callback({ LOCK: { UPDATE: "UPDATE" } });
  models.RefreshSession.findOne = async () => session;
  models.Userdetail.findByPk = async () => ({ id: 1, firstname: "Dana", lastname: "Khaing", email: "dana@example.com" });
  models.RefreshSession.create = async () => {};
  try {
    const result = await rotateSession("old-token", "test");
    assert.ok(session.revokedAt instanceof Date);
    assert.ok(result.token);
    assert.notEqual(result.refreshToken, "old-token");
  } finally {
    models.sequelize.transaction = originals.transaction;
    models.RefreshSession.findOne = originals.findOne;
    models.Userdetail.findByPk = originals.findByPk;
    models.RefreshSession.create = originals.create;
  }
});
