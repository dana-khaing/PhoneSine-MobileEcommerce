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
function provisioningUri(email, secret) { return `otpauth://totp/Phone%20Sine:${encodeURIComponent(email)}?secret=${secret}&issuer=Phone%20Sine`; }
function recoveryCodes() { return Array.from({ length: 8 }, () => crypto.randomBytes(5).toString("hex").toUpperCase()); }
function consumeRecoveryCode(codes, submittedCode) {
  const normalized = String(submittedCode || "").trim().toUpperCase();
  const index = (codes || []).findIndex((code) => code === normalized);
  return index < 0
    ? { used: false, remaining: codes || [] }
    : { used: true, remaining: codes.filter((_, candidate) => candidate !== index) };
}
module.exports = { codeFor, consumeRecoveryCode, generateSecret, provisioningUri, recoveryCodes, verifyCode };
