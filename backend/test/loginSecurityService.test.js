const test = require("node:test");
const assert = require("node:assert/strict");
const models = require("../models");
const { listLoginEvents, recordLoginEvent } = require("../src/loginSecurityService");

test("records and lists bounded login history", async () => {
  const originals = { create: models.LoginEvent.create, findAll: models.LoginEvent.findAll };
  let created;
  let query;
  models.LoginEvent.create = async (values) => { created = values; return values; };
  models.LoginEvent.findAll = async (values) => { query = values; return []; };
  try {
    await recordLoginEvent({ userId: 3, method: "password", successful: true });
    await listLoginEvents(3);
    assert.equal(created.userId, 3);
    assert.equal(created.successful, true);
    assert.equal(query.where.userId, 3);
    assert.equal(query.limit, 50);
  } finally {
    models.LoginEvent.create = originals.create;
    models.LoginEvent.findAll = originals.findAll;
  }
});
