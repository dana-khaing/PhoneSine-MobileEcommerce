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

export default function ProductList({ filterBrand, search }) {
  const [items, setItems] = useState(products);

  const filterByBrand = (filterBrand) => {
    const filteredItems = products.filter((itembrand) => {
      return itembrand.brand === filterBrand;
    });
    setItems(filteredItems);
  };

  const filterBySearch = (search) => {
    const filteredItems = products.filter((item) => {
      return item.name.toLowerCase().includes(search.toLowerCase());
    });
    console.log("Search Query:", search); // Check if searchQuery is a string
    console.log("Filtered Items:", filteredItems); // Check the filtered items

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
    if (search === "") {
      setItems(products);
    } else {
      filterBySearch(String(search));
    }
  }, [search]);
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
