"use client";

import ProductList from "./components/productList.js";
import SideBar from "./components/sideBar.js";
import { useState } from "react";
import Payment from "./components/paymentPage.js";
import Link from "next/link";

export default function ProductsPage() {
  const MIN = 100;
  const MAX = 2000;
  const [filterBrand, setFilterBrand] = useState("All Products");
  const [search, setSearch] = useState("");
  const [values, setValues] = useState([MIN, MAX]);
  const [payment, setPayment] = useState(false);
  const [detailsProduct, setDetailsProduct] = useState([]);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

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
    <div className="my-0 flex w-full flex-col justify-evenly lg:flex-row">
      <div className="m-5 overflow-hidden text-ellipsis whitespace-nowrap border-2 px-5 py-5 shadow-md lg:h-screen lg:w-[20%] lg:flex-shrink-0">
        <SideBar
          onBrandClick={handleFilterChange}
          selectedbranch={filterBrand}
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
          <div className="mx-5 mb-4 flex flex-wrap justify-end gap-2">
            <Link href="/products/compare" className="rounded border px-3 py-2">Compare products</Link>
            <select className="rounded border px-3 py-2" value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }}>
              <option value="newest">Newest</option><option value="name">Name</option><option value="price_asc">Price low to high</option><option value="price_desc">Price high to low</option>
            </select>
          </div>
          <div>
            <ProductList
              filterBrand={filterBrand}
              filterSearch={search}
              price={values}
              paymentlistener={paymentlisteneropen}
              productdetail={productDetailskey}
              sort={sort}
              page={page}
            />
            <div className="my-6 flex justify-center gap-2"><button className="rounded border px-4 py-2" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Previous</button><button className="rounded border px-4 py-2" onClick={() => setPage((value) => value + 1)}>Next</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
