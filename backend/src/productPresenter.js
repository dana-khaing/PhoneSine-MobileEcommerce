function presentProduct(product) {
  const record = typeof product.toJSON === "function" ? product.toJSON() : product;
  const priceAmount = record.priceAmount ?? record.priceInPence;
  return {
    ...record,
    priceInPence: priceAmount,
    price: priceAmount / 100,
    availableStock: record.stockQuantity - record.reservedQuantity,
  };
}

module.exports = { presentProduct };
