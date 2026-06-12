function presentProduct(product) {
  const record = typeof product.toJSON === "function" ? product.toJSON() : product;
  return {
    ...record,
    priceInPence: record.priceAmount,
    price: record.priceAmount / 100,
    availableStock: record.stockQuantity - record.reservedQuantity,
  };
}

module.exports = { presentProduct };
