function presentProduct(product) {
  const record = typeof product.toJSON === "function" ? product.toJSON() : product;
  const priceAmount = record.priceAmount ?? record.priceInPence;
  const variants = record.variants?.map((variant) => ({
    ...variant,
    priceInPence: variant.priceAmount,
    price: variant.priceAmount / 100,
    availableStock: variant.stockQuantity - variant.reservedQuantity,
  }));
  return {
    ...record,
    priceInPence: priceAmount,
    price: priceAmount / 100,
    availableStock: record.stockQuantity - record.reservedQuantity,
    ...(variants ? { variants } : {}),
  };
}

module.exports = { presentProduct };
