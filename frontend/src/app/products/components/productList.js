import ProductCard from "./productCard";
import React, { useState, useEffect } from "react";

export default function ProductList({
  filterBrand,
  filterSearch,
  price,
  paymentlistener,
}) {
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

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
    const filteredItems = products?.filter((item) => {
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
          paymentlistener={paymentlistener}
        />
      ))}
    </div>
  );
}
