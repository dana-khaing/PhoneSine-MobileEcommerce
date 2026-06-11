const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const { PasswordResetToken, Userdetail, sequelize } = require("../models");
const { createAccountToken, hashAccountToken } = require("./accountTokenService");
const { sendAccountEmail } = require("./accountEmailService");
const { validateRegistrationInput } = require("./authValidation");

async function issuePasswordReset(user) {
  const { token, tokenHash } = createAccountToken();
  await PasswordResetToken.destroy({ where: { userId: user.id, usedAt: null } });
  await PasswordResetToken.create({
    userId: user.id,
    tokenHash,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  });
  const url = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${token}`;
  await sendAccountEmail({
    to: user.email,
    subject: "Reset your Phone Sine password",
    text: `Reset your password: ${url}`,
  });
}

async function resetPassword(token, password) {
  const passwordError = validateRegistrationInput({
    firstname: "Valid",
    lastname: "User",
    email: "valid@example.com",
    password,
  });
  if (passwordError) throw new Error(passwordError);

  return sequelize.transaction(async (transaction) => {
    const record = await PasswordResetToken.findOne({
      where: {
        tokenHash: hashAccountToken(token),
        usedAt: null,
        expiresAt: { [Op.gt]: new Date() },
      },
      transaction,
      lock: transaction.LOCK?.UPDATE,
    });
    if (!record) throw new Error("Password reset token is invalid or expired");
    const user = await Userdetail.findByPk(record.userId, { transaction });
    if (!user) throw new Error("Password reset account not found");
    const now = new Date();
    await user.update({ password: await bcrypt.hash(password, 10) }, { transaction });
    await record.update({ usedAt: now }, { transaction });
  });
}

module.exports = { issuePasswordReset, resetPassword };
