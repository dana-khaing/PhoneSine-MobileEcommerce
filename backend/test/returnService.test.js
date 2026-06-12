const test = require("node:test");
const assert = require("node:assert/strict");
const models = require("../models");
const { returnFields, updateReturn } = require("../src/returnService");
test("validates return requests and status transitions", async () => {
  const originalCreate = models.OrderEvent.create;
  models.OrderEvent.create = async () => {};
  try {
  assert.deepEqual(returnFields({ reason: "Damaged", details: "Screen cracked" }), { reason: "Damaged", details: "Screen cracked" });
  const request = { status: "requested", orderId: 1, update: async (fields) => Object.assign(request, fields) };
  await updateReturn(request, { status: "approved" });
  assert.equal(request.status, "approved");
  await assert.rejects(updateReturn(request, { status: "refunded" }), /Cannot move/);
  } finally {
    models.OrderEvent.create = originalCreate;
  }
});
