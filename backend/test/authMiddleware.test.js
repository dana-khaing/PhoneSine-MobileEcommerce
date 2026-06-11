const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const models = require("../models");
const { requireAdmin } = require("../src/authMiddleware");

test("requires the database admin role instead of an email allowlist", async () => {
  const originalSecret = process.env.JWT_SECRET;
  const originalFind = models.Userdetail.findByPk;
  process.env.JWT_SECRET = "test-secret";
  models.Userdetail.findByPk = async () => ({ role: "customer" });
  const req = { headers: { authorization: `Bearer ${jwt.sign({ userId: 1, email: "admin@example.com" }, process.env.JWT_SECRET)}` } };
  const result = await new Promise((resolve) => {
    requireAdmin(req, { status: (status) => ({ send: (message) => resolve({ status, message }) }) }, () => resolve({ status: 200 }));
  });
  try {
    assert.equal(result.status, 403);
  } finally {
    process.env.JWT_SECRET = originalSecret;
    models.Userdetail.findByPk = originalFind;
  }
});
