"use client";

import ProductList from "./components/productList.js";
import SideBar from "./components/sideBar.js";

export default function ProductsPage() {
  return (
    <div className="my-0 flex justify-center">
      <div className="inline-flex">
        <div className="w-52 my-5 shadow-md border-solid border-2 px-5 py-8">
          <SideBar />
        </div>
        <div>
          <p className="py-5 flex justify-center">All Products</p>
          <div>
            <ProductList />
          </div>
        </div>
      </div>
    </div>
  );
}
