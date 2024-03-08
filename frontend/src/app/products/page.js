"use client";

import ProductList from "./components/productList.js";
import SideBar from "./components/sideBar.js";
import { useState } from "react";

export default function ProductsPage() {
  const [filterBrand, setFilterBrand] = useState("All Products");
  const [search, setSearch] = useState("");

  const handleFilterChange = (brand) => {
    setFilterBrand(brand);
  };

  const handleSearchChange = (catSearch) => {
    setSearch(catSearch.target.value);
  };

  return (
    <div className="my-0 flex justify-evenly w-screen">
      <div className="w-[15%] my-5 mx-5 h-screen shadow-md border-solid border-2 px-5 py-5 flex-shrink-0">
        <SideBar
          onBrandClick={handleFilterChange}
          Searchlistener={handleSearchChange}
        />
      </div>
      <div className="flex-1">
        <p className="py-5 mx-5 flex justify-center">
          {filterBrand.toUpperCase()}
        </p>
        <div>
          <ProductList filterBrand={filterBrand} search={search} />
        </div>
      </div>
    </div>
  );
}
