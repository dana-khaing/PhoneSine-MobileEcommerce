import ProductCard from "./productCard";
import React, { useState, useEffect } from "react";
import { filterProducts } from "../productFilters.mjs";

export default function ProductList({
  filterBrand,
  filterSearch,
  price,
  paymentlistener,
  productdetail,
}) {
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  // Just fetching the data from the backend
  const fetchData = async () => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_PRODUCT_LIST_URL);
      const jsonData = await response.json();
      setProducts(jsonData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    setItems(
      filterProducts(products, {
        search: filterSearch,
        brand: filterBrand,
        price,
      })
    );
  }, [products, filterSearch, filterBrand, price]);

  return (
    <div className="grid grid-cols-4">
      {/* Product should have photo scr so that we can fetch this photo from the backend */}
      {items?.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          brand={product.brand}
          name={product.name}
          price={product.price}
          description={product.description}
          paymentlistener={paymentlistener}
          productdetail={() => productdetail(product)}
        />
      ))}
    </div>
  );
}
