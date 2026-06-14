const { Op } = require("sequelize");

function discoveryQuery(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
  const where = { active: true };
  if (query.search) {
    const search = `%${String(query.search).trim()}%`;
    where[Op.or] = [{ name: { [Op.like]: search } }, { brand: { [Op.like]: search } }, { description: { [Op.like]: search } }];
  }
  if (query.brand) where.brand = String(query.brand).trim();
  if (query.categoryId) where.categoryId = Number(query.categoryId);
  const minPrice = Number(query.minPrice);
  const maxPrice = Number(query.maxPrice);
  if (Number.isFinite(minPrice) || Number.isFinite(maxPrice)) {
    where.priceAmount = {};
    if (Number.isFinite(minPrice)) where.priceAmount[Op.gte] = Math.round(minPrice * 100);
    if (Number.isFinite(maxPrice)) where.priceAmount[Op.lte] = Math.round(maxPrice * 100);
  }
  const orders = { price_asc: ["priceAmount", "ASC"], price_desc: ["priceAmount", "DESC"], name: ["name", "ASC"], newest: ["id", "DESC"] };
  return { where, limit, offset: (page - 1) * limit, page, order: [orders[query.sort] || orders.newest] };
}
module.exports = { discoveryQuery };
