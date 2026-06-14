const crypto = require("crypto");
const { LoyaltyAccount, LoyaltyTransaction, sequelize } = require("../models");

const REFERRAL_BONUS = 500;

function pointsForOrder(totalAmount) {
  return Math.max(0, Math.floor(Number(totalAmount || 0) / 100));
}

async function accountForUser(userId, transaction) {
  const [account] = await LoyaltyAccount.findOrCreate({
    where: { userId },
    defaults: { userId, referralCode: crypto.randomBytes(5).toString("hex").toUpperCase() },
    transaction,
  });
  return account;
}

async function credit(account, values, transaction) {
  const [entry, created] = await LoyaltyTransaction.findOrCreate({
    where: { userId: account.userId, orderId: values.orderId || null, type: values.type },
    defaults: { userId: account.userId, ...values },
    transaction,
  });
  if (created) await account.increment("pointsBalance", { by: values.points, transaction });
  return entry;
}

async function awardOrderPoints(order, transaction) {
  if (!order.userId) return null;
  const account = await accountForUser(order.userId, transaction);
  await credit(account, {
    orderId: order.id,
    type: "purchase",
    points: pointsForOrder(order.totalAmount),
    description: `Points earned from order #${order.id}`,
  }, transaction);

  if (account.referredByUserId && !account.referralRewardedAt) {
    const referrer = await accountForUser(account.referredByUserId, transaction);
    await credit(account, { orderId: order.id, type: "referral_welcome", points: REFERRAL_BONUS, description: "Referral welcome reward" }, transaction);
    await credit(referrer, { orderId: order.id, type: "referral_reward", points: REFERRAL_BONUS, description: "Successful referral reward" }, transaction);
    await account.update({ referralRewardedAt: new Date() }, { transaction });
  }
  return account;
}

async function applyReferralCode(userId, code) {
  return sequelize.transaction(async (transaction) => {
    const account = await accountForUser(userId, transaction);
    if (account.referredByUserId) throw new Error("Referral code already applied");
    const referrer = await LoyaltyAccount.findOne({ where: { referralCode: String(code || "").trim().toUpperCase() }, transaction });
    if (!referrer || referrer.userId === userId) throw new Error("Valid referral code required");
    await account.update({ referredByUserId: referrer.userId }, { transaction });
    return account;
  });
}

async function loyaltySummary(userId) {
  const account = await accountForUser(userId);
  const transactions = await LoyaltyTransaction.findAll({ where: { userId }, order: [["createdAt", "DESC"]], limit: 50 });
  return { pointsBalance: account.pointsBalance, referralCode: account.referralCode, referred: Boolean(account.referredByUserId), transactions };
}

module.exports = { applyReferralCode, awardOrderPoints, loyaltySummary, pointsForOrder };
