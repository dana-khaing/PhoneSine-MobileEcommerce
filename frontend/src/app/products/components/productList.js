import ProductCard from "./productCard";
import React, { useState } from "react";
const products = [
  {
    id: 1,
    name: "IPHONE 14 PRO",
    brand: "Apple",
    price: 999.99,
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
    brand: "Google Pixel",
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
    brand: "Google Pixel",
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

export default function ProductList({ filterBrand }) {
  const [items, setitems] = useState(products);

  const filterByBrand = (catItem) => {
    const filteredItems = products.filter((itembrand) => {
      return itembrand.brand === catItem;
    });
    setitems(filteredItems);
  };

  React.useEffect(() => {
    if (filterBrand === "All Products") {
      setitems(products);
    } else {
      filterByBrand(filterBrand);
    }
  }, [filterBrand]);

  return (
    <div className="grid grid-cols-4">
      {items?.map((product) => (
        <ProductCard
          key={product.id}
          brand={product.brand}
          name={product.name}
          price={product.price}
        />
      ))}
    </div>
  );
}
