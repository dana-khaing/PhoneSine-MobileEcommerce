"use client";
import React from "react";
import ProductCard from "./components/product-card.js";

const products = [
  {
    name: "IPHONE 14 PRO",
    brand: "Apple",
    price: 999,
  },
  {
    name: "GALAXY S22 ULTRA",
    brand: "Samsung",
    price: 1299,
  },
  {
    name: "PIXEL 7 PRO",
    brand: "Google",
    price: 899,
  },
  {
    name: "IPHONE 14 PRO",
    brand: "Apple",
    price: 999,
  },
  {
    name: "GALAXY S22 ULTRA",
    brand: "Samsung",
    price: 1299,
  },
  {
    name: "PIXEL 7 PRO",
    brand: "Google",
    price: 899,
  },
  {
    name: "IPHONE 14 PRO",
    brand: "Apple",
    price: 999,
  },
  {
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
            brand={product.brand}
            name={product.name}
            price={product.price}
          />
        ))}
      </div>
    </div>
  );
}
