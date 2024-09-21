import ProductCard from "./productCard";
import React, { useState, useEffect } from "react";

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
    setItems(products);
  }, [products]);

  const applyFilters = () => {
    let filteredItems = products;

    // search filter
    if (filterSearch) {
      filteredItems = filteredItems.filter((item) => {
        return (
          item.name.toLowerCase().includes(filterSearch.toLowerCase()) ||
          item.brand.toLowerCase().includes(filterSearch.toLowerCase())
        );
      });
    }

    // brand filter
    if (filterBrand && filterBrand !== "All Products") {
      filteredItems = filteredItems.filter((item) => {
        return item.brand === filterBrand;
      });
    }

    // price filter
    if (price && price.length === 2) {
      filteredItems = filteredItems.filter((item) => {
        return item.price >= price[0] && item.price <= price[1];
      });
    }

    setItems(filteredItems);
  };

  React.useEffect(() => {
    applyFilters();
  }, [filterSearch, filterBrand, price]);

  return (
    <div className="grid grid-cols-4">
      {/* Product should have photo scr so that we can fetch this photo from the backend */}
      {items?.map((product) => (
        <ProductCard
          key={product.id}
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
