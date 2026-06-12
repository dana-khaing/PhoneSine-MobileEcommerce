import ProductCard from "./productCard";
import React, { useState, useEffect } from "react";
import { filterProducts } from "../productFilters.mjs";

export default function ProductList({
  filterBrand,
  filterSearch,
  price,
  paymentlistener,
  productdetail,
  sort,
  page,
}) {
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    fetchData();
  }, [filterSearch, sort, page]);

  // Just fetching the data from the backend
  const fetchData = async () => {
    try {
      const params = new URLSearchParams({ search: filterSearch, sort, page: String(page), limit: "12" });
      const response = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_LIST_URL}?${params}`);
      if (!response.ok) throw new Error("Unable to load products");
      const jsonData = await response.json();
      setProducts(jsonData);
      setStatus("ready");
    } catch (error) {
      console.error("Error fetching data:", error);
      setStatus("error");
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

  if (status === "loading") {
    return <p className="p-10 text-center text-neutral-500">Loading products...</p>;
  }
  if (status === "error") {
    return <p className="p-10 text-center text-red-700">Unable to load products. Please try again.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Product should have photo scr so that we can fetch this photo from the backend */}
      {items?.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          brand={product.brand}
          name={product.name}
          price={product.price}
          description={product.description}
          availableStock={product.availableStock}
          paymentlistener={paymentlistener}
          productdetail={() => productdetail(product)}
        />
      ))}
    </div>
  );
}
