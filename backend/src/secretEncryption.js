const crypto = require("crypto");
function key() { return crypto.createHash("sha256").update(process.env.MFA_ENCRYPTION_KEY || process.env.JWT_SECRET).digest(); }
function encrypt(value) {
  const iv = crypto.randomBytes(12), cipher = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([cipher.update(String(value), "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString("base64url")).join(".");
}
function decrypt(value) {
  const parts = String(value).split(".");
  if (parts.length !== 3) return value;
  const [iv, tag, encrypted] = parts.map((part) => Buffer.from(part, "base64url"));
  const decipher = crypto.createDecipheriv("aes-256-gcm", key(), iv); decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}
module.exports = { decrypt, encrypt };
