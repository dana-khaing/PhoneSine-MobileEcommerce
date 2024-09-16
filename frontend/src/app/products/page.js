"use client";

import ProductList from "./components/productList.js";
import SideBar from "./components/sideBar.js";
import { useState } from "react";
import Payment from "./components/paymentPage.js";

export default function ProductsPage() {
  const MIN = 100;
  const MAX = 2000;
  const [filterBrand, setFilterBrand] = useState("All Products");
  const [search, setSearch] = useState("");
  const [values, setValues] = useState([MIN, MAX]);
  const [payment, setPayment] = useState(false);
  const [detailsProduct, setDetailsProduct] = useState([]);

  const handleFilterChange = (catbrand) => {
    setFilterBrand(catbrand);
  };

  const handleSearchChange = (catSearch) => {
    setSearch(catSearch.target.value);
  };

  const handlePriceChange = (price) => {
    setValues(price);
  };
  const paymentlisteneropen = () => {
    setPayment(true);
  };
  const paymentlistenerclose = () => {
    setPayment(false);
  };
  const productDetailskey = (product) => {
    setDetailsProduct(product);
  };

  return (
    <div className="my-0 flex justify-evenly w-screen">
      <div className="w-[15%] my-5 mx-5 h-screen shadow-md border-solid border-2 px-5 py-5 flex-shrink-0 overflow-hidden text-ellipsis whitespace-nowrap">
        <SideBar
          onBrandClick={handleFilterChange}
          Searchlistener={handleSearchChange}
          priceListener={handlePriceChange}
          priceValue={values}
          MIN={MIN}
          MAX={MAX}
        />
      </div>
      {payment ? (
        <Payment
          backToProduct={paymentlistenerclose}
          productdetail={detailsProduct}
        />
      ) : (
        <div className="flex-1">
          <p className="py-[1.1rem] mx-5 flex justify-center">
            {filterBrand.toUpperCase()}
          </p>
          <div>
            <ProductList
              filterBrand={filterBrand}
              filterSearch={search}
              price={values}
              paymentlistener={paymentlisteneropen}
              productdetail={productDetailskey}
            />
          </div>
        </div>
      )}
    </div>
  );
}
