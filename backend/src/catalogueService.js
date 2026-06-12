function parseProductCsv(csv) {
  const [header, ...rows] = String(csv).trim().split(/\r?\n/).filter(Boolean).map((line) => line.split(",").map((value) => value.trim()));
  const required = ["name", "brand", "priceAmount", "stockQuantity"];
  if (!required.every((field) => header.includes(field))) throw new Error("CSV must include name, brand, priceAmount, stockQuantity");
  return rows.map((row) => Object.fromEntries(header.map((field, index) => [field, ["priceAmount", "stockQuantity"].includes(field) ? Number(row[index]) : row[index]])));
}
function productsToCsv(products) {
  return ["id,name,brand,priceAmount,stockQuantity,active", ...products.map((product) => [product.id, product.name, product.brand, product.priceAmount, product.stockQuantity, product.active].join(","))].join("\n");
}
module.exports = { parseProductCsv, productsToCsv };
