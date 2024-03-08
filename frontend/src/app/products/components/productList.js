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

export default function ProductList({ filterBrand, filterSearch, price }) {
  const [items, setItems] = useState(products);

  const filterByBrand = (filterBrand) => {
    const filteredItems = products.filter((itembrand) => {
      return itembrand.brand === filterBrand;
    });
    setItems(filteredItems);
  };

  const filterBySearch = (filterSearch) => {
    const filteredItems = products.filter((item) => {
      return (
        item.name.toLowerCase().includes(filterSearch) ||
        item.brand.toLowerCase().includes(filterSearch)
      );
    });

    setItems(filteredItems);
  };

  React.useEffect(() => {
    if (filterBrand === "All Products") {
      setItems(products);
    } else {
      filterByBrand(filterBrand);
    }
  }, [filterBrand]);

  React.useEffect(() => {
    if (filterSearch === "") {
      setItems(products);
    } else {
      filterBySearch(String(filterSearch).toLowerCase());
    }
  }, [filterSearch]);

  React.useEffect(() => {
    const filteredItems = products.filter((item) => {
      return item.price >= price[0] && item.price <= price[1];
    });
    setItems(filteredItems);
  }, [price]);

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
