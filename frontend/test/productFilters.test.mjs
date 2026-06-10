import test from "node:test";
import assert from "node:assert/strict";

import { filterProducts } from "../src/app/products/productFilters.mjs";

const products = [
  { id: 1, name: "IPHONE 14 PRO", brand: "Apple", price: 999 },
  { id: 2, name: "GALAXY S22 ULTRA", brand: "Samsung", price: 1299 },
  { id: 3, name: "PIXEL 7 PRO", brand: "Google Pixel", price: 899 },
];

test("returns all products when no filters are active", () => {
  assert.deepEqual(filterProducts(products), products);
});

test("searches product names and brands without matching case", () => {
  assert.deepEqual(
    filterProducts(products, { search: "pixel" }).map((item) => item.id),
    [3]
  );
  assert.deepEqual(
    filterProducts(products, { search: "APPLE" }).map((item) => item.id),
    [1]
  );
});

test("combines brand and inclusive price filters", () => {
  assert.deepEqual(
    filterProducts(products, { brand: "Samsung", price: [1000, 1299] }).map(
      (item) => item.id
    ),
    [2]
  );
});

test("does not mutate the original product list", () => {
  const original = structuredClone(products);

  filterProducts(products, { search: "iphone", price: [900, 1000] });

  assert.deepEqual(products, original);
});
