"use client";

import ProductList from "./components/productList.js";
import SidePanel from "./components/sideBar.js";

export default function ProductsPage() {
  return (
    <div className="ml-5 mr--5 my-0">
      <div className="inline-flex">
        <div className="w-48 my-5 shadow-md border-solid border-2 px-5 py-5">
          <SidePanel />
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
