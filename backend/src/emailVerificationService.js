const { Op } = require("sequelize");
const { EmailVerificationToken, Userdetail, sequelize } = require("../models");
const { createAccountToken, hashAccountToken } = require("./accountTokenService");
const { sendAccountEmail } = require("./accountEmailService");

async function issueEmailVerification(user) {
  const { token, tokenHash } = createAccountToken();
  await EmailVerificationToken.destroy({
    where: { userId: user.id, usedAt: null },
  });
  await EmailVerificationToken.create({
    userId: user.id,
    tokenHash,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
  const url = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email?token=${token}`;
  await sendAccountEmail({
    to: user.email,
    subject: "Verify your Phone Sine email",
    text: `Verify your email address: ${url}`,
  });
  return token;
}

async function verifyEmailToken(token) {
  return sequelize.transaction(async (transaction) => {
    const record = await EmailVerificationToken.findOne({
      where: {
        tokenHash: hashAccountToken(token),
        usedAt: null,
        expiresAt: { [Op.gt]: new Date() },
      },
      transaction,
      lock: transaction.LOCK?.UPDATE,
    });
    if (!record) throw new Error("Verification token is invalid or expired");
    const user = await Userdetail.findByPk(record.userId, { transaction });
    if (!user) throw new Error("Verification account not found");
    const now = new Date();
    await user.update({ emailVerifiedAt: now }, { transaction });
    await record.update({ usedAt: now }, { transaction });
    return user;
  });
}

module.exports = { issueEmailVerification, verifyEmailToken };
