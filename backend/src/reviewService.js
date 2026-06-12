const { Op } = require("sequelize");
const { Order, OrderItem } = require("../models");

function reviewFields(input) {
  const rating = Number(input.rating);
  const title = String(input.title || "").trim();
  const body = String(input.body || "").trim();
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error("Rating must be between 1 and 5");
  if (!title || !body || title.length > 120 || body.length > 2000) throw new Error("Review title and body are required");
  return { rating, title, body };
}
async function hasPurchased(userId, productId) {
  return Boolean(await OrderItem.findOne({
    where: { productId },
    include: [{ model: Order, where: { userId, status: { [Op.in]: ["paid", "processing", "shipped", "delivered"] } } }],
  }));
}
module.exports = { hasPurchased, reviewFields };
