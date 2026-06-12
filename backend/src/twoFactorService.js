const crypto = require("crypto");

function generateSecret() {
  return crypto.randomBytes(20).toString("hex");
}
function codeFor(secret, timestamp = Date.now()) {
  const counter = Math.floor(timestamp / 30000);
  return crypto.createHmac("sha256", secret).update(String(counter)).digest("hex").slice(-6);
}
function verifyCode(secret, code, timestamp = Date.now()) {
  return [-30000, 0, 30000].some((offset) => codeFor(secret, timestamp + offset) === String(code));
}
module.exports = { codeFor, generateSecret, verifyCode };
