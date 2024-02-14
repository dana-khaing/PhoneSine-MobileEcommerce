"use client";

import React from "react";
import ProductCard from "./components/product-card.js";

const products = [
  {
    id: 1,
    name: "IPHONE 14 PRO",
    brand: "Apple",
    price: 999,
  },
  {
    id: 2,
    name: "GALAXY S22 ULTRA",
    brand: "Samsung",
    price: 1299,
  },
  {
    id: 3,
    name: "PIXEL 7 PRO",
    brand: "Google",
    price: 899,
  },
  {
    id: 4,
    name: "IPHONE 14 PRO",
    brand: "Apple",
    price: 999,
  },
  {
    id: 5,
    name: "GALAXY S22 ULTRA",
    brand: "Samsung",
    price: 1299,
  },
  {
    id: 6,
    name: "PIXEL 7 PRO",
    brand: "Google",
    price: 899,
  },
  {
    id: 7,
    name: "IPHONE 14 PRO",
    brand: "Apple",
    price: 999,
  },
  {
    id: 8,
    name: "GALAXY S22 ULTRA",
    brand: "Samsung",
    price: 1299,
  },
];

export default function ProductsPage() {
  return (
    <div className="mx-20 my-0">
      <p className="px-10 pt-14 pb-5 flex justify-center">All Products</p>
      <div className="grid grid-cols-4">
        {products?.map((product) => (
          <ProductCard
            key={product.id}
            brand={product.brand}
            name={product.name}
            price={product.price}
          />
        ))}
      </div>
    </div>
  );
}
