const crypto = require("crypto");

function createAccountToken() {
  const token = crypto.randomBytes(32).toString("hex");
  return { token, tokenHash: hashAccountToken(token) };
}

function hashAccountToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

module.exports = { createAccountToken, hashAccountToken };
