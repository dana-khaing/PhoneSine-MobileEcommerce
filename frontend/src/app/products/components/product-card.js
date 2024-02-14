import React from "react";
import DisplayCard from "./displayCard";

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

export default function ProductCard() {
  return (
    <div className="grid grid-cols-4">
      {products?.map((product) => (
        <DisplayCard
          brand={product.brand}
          name={product.name}
          price={product.price}
        />
      ))}
    </div>
  );
}
