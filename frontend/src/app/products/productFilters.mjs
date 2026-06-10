export function filterProducts(
  products,
  { search = "", brand = "All Products", price = [] } = {}
) {
  let filteredItems = products;

  if (search) {
    const normalizedSearch = search.toLowerCase();
    filteredItems = filteredItems.filter(
      (item) =>
        item.name.toLowerCase().includes(normalizedSearch) ||
        item.brand.toLowerCase().includes(normalizedSearch)
    );
  }

  if (brand && brand !== "All Products") {
    filteredItems = filteredItems.filter((item) => item.brand === brand);
  }

  if (price.length === 2) {
    filteredItems = filteredItems.filter(
      (item) => item.price >= price[0] && item.price <= price[1]
    );
  }

  return filteredItems;
}
