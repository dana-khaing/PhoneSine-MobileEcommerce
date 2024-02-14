"use client";
import React from "react";
import ProductCard from "./components/product-card.js";
import { Branches } from "./components/sideBar.js";

export default function ProductsPage() {
  return (
    <div className="ml-5 mr-0 my-0">
      <div className="inline-flex">
        <div className="w-48 my-5 shadow-md border-solid border-2 px-5 py-5">
          <Branches />
        </div>
        <div>
          <p className="py-5 flex justify-center">All Products</p>
          <div>
            <ProductCard />
          </div>
        </div>
      </div>
    </div>
  );
}
