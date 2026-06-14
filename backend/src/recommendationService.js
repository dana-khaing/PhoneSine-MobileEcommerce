const { Op } = require("sequelize");
const { Product, ProductView } = require("../models");
const { presentProduct } = require("./productPresenter");

function preferredCategories(views) {
  const scores = new Map();
  for (const view of views) {
    const categoryId = view.product?.categoryId;
    if (categoryId) scores.set(categoryId, (scores.get(categoryId) || 0) + Number(view.viewCount || 1));
  }
  return [...scores.entries()].sort((a, b) => b[1] - a[1]).map(([categoryId]) => categoryId);
}

async function recordProductView(userId, productId) {
  const product = await Product.findOne({ where: { id: productId, active: true } });
  if (!product) throw new Error("Product not found");
  const [view, created] = await ProductView.findOrCreate({
    where: { userId, productId: product.id },
    defaults: { userId, productId: product.id, viewCount: 1, lastViewedAt: new Date() },
  });
  if (!created) await view.update({ viewCount: view.viewCount + 1, lastViewedAt: new Date() });
  return view;
}

async function recentProducts(userId, limit = 8) {
  const views = await ProductView.findAll({
    where: { userId },
    include: [{ association: "product", where: { active: true }, include: ["images"] }],
    order: [["lastViewedAt", "DESC"]],
    limit,
  });
  return views.map((view) => presentProduct(view.product));
}

async function personalizedProducts(userId, limit = 8) {
  const views = await ProductView.findAll({
    where: { userId },
    include: [{ association: "product", attributes: ["id", "categoryId"] }],
    order: [["lastViewedAt", "DESC"]],
    limit: 30,
  });
  const categoryIds = preferredCategories(views);
  const viewedIds = views.map((view) => view.productId);
  const where = { active: true, ...(viewedIds.length ? { id: { [Op.notIn]: viewedIds } } : {}) };
  if (categoryIds.length) where.categoryId = { [Op.in]: categoryIds };
  const products = await Product.findAll({ where, include: ["images"], order: [["createdAt", "DESC"]], limit });
  return products.map(presentProduct);
}

module.exports = { personalizedProducts, preferredCategories, recentProducts, recordProductView };
