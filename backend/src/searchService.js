const { Product } = require("../models");

function editDistance(left, right) {
  const a = String(left || "").toLowerCase();
  const b = String(right || "").toLowerCase();
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const current = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[b.length];
}

function searchScore(product, input) {
  const term = String(input || "").trim().toLowerCase();
  if (term.length < 2) return Infinity;
  const values = [product.name, product.brand].filter(Boolean).map((value) => String(value).toLowerCase());
  if (values.some((value) => value.includes(term))) return 0;
  const words = values.flatMap((value) => value.split(/\s+/));
  return Math.min(...words.map((word) => editDistance(word, term)));
}

function rankedMatches(products, input, limit = 8) {
  return products
    .map((product) => ({ product, score: searchScore(product, input) }))
    .filter(({ score }) => score <= 2)
    .sort((a, b) => a.score - b.score || a.product.name.localeCompare(b.product.name))
    .slice(0, limit)
    .map(({ product }) => product);
}

async function candidateProducts() {
  return Product.findAll({ where: { active: true }, attributes: ["id", "name", "brand"], limit: 300 });
}

async function fuzzyProductIds(input, limit = 50) {
  return rankedMatches(await candidateProducts(), input, limit).map((product) => product.id);
}

async function searchSuggestions(input, limit = 8) {
  return rankedMatches(await candidateProducts(), input, limit).map(({ id, name, brand }) => ({ id, name, brand }));
}

module.exports = { editDistance, fuzzyProductIds, rankedMatches, searchScore, searchSuggestions };
