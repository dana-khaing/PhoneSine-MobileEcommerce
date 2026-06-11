const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const { RefreshSession, Userdetail, sequelize } = require("../models");
const { createAccountToken, hashAccountToken } = require("./accountTokenService");

function accessTokenFor(user) {
  return jwt.sign(
    { userId: user.id, username: `${user.firstname} ${user.lastname}`, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
}

async function createSession(user, { rememberMe = false, userAgent } = {}) {
  const { token, tokenHash } = createAccountToken();
  await RefreshSession.create({
    userId: user.id,
    tokenHash,
    expiresAt: new Date(Date.now() + (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000),
    userAgent,
  });
  return { token: accessTokenFor(user), refreshToken: token };
}

async function rotateSession(refreshToken, userAgent) {
  return sequelize.transaction(async (transaction) => {
    const session = await RefreshSession.findOne({
      where: { tokenHash: hashAccountToken(refreshToken), revokedAt: null, expiresAt: { [Op.gt]: new Date() } },
      transaction,
      lock: transaction.LOCK?.UPDATE,
    });
    if (!session) throw new Error("Refresh session is invalid or expired");
    const user = await Userdetail.findByPk(session.userId, { transaction });
    if (!user) throw new Error("Refresh session account not found");
    await session.update({ revokedAt: new Date() }, { transaction });
    const { token, tokenHash } = createAccountToken();
    await RefreshSession.create({
      userId: user.id,
      tokenHash,
      expiresAt: session.expiresAt,
      userAgent,
    }, { transaction });
    return { token: accessTokenFor(user), refreshToken: token };
  });
}

async function revokeSession(refreshToken) {
  await RefreshSession.update(
    { revokedAt: new Date() },
    { where: { tokenHash: hashAccountToken(refreshToken), revokedAt: null } }
  );
}

module.exports = { accessTokenFor, createSession, revokeSession, rotateSession };
