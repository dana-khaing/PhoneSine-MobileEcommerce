const { Promotion, PromotionUsage } = require("../models");

async function releasePromotionUsage(orderId, transaction) {
  const usage = await PromotionUsage.findOne({ where: { orderId }, transaction });
  if (!usage) return false;
  const promotion = await Promotion.findByPk(usage.promotionId, {
    transaction,
    lock: transaction.LOCK?.UPDATE,
  });
  await usage.destroy({ transaction });
  if (promotion && promotion.useCount > 0) {
    await promotion.decrement("useCount", { by: 1, transaction });
  }
  return true;
}

module.exports = { releasePromotionUsage };
