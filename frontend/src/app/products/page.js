"use client";
import React from "react";
import ProductCard from "./components/product-card.js";
import { Branches } from "./components/sideBar.js";

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
    <div className="ml-5 mr-0 my-0">
      <div className="inline-flex">
        <div className="w-48 my-5 shadow-md border-solid border-2 px-5 py-5">
          <Branches />
        </div>
        <div>
          <p className="py-5 flex justify-center">All Products</p>
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
      </div>
    </div>
  );
}
