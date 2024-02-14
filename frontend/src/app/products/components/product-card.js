import React from "react";

export default function ProductCard({ name, brand, price }) {
  return (
    <div className="px-12 py-9">
      <div className="px-0 py-12 bg-gray-100 flex justify-center">
        <img
          src="/iph15-pro.jpeg"
          alt="Product Image"
          className="w-36 h-auto"
        />
      </div>
      <div className="p-2">
        <p className="font-semibold">{brand}</p>
        <p className="flex justify-between items-center">
          <span className="text-gray-500 text-sm ml-0.5"> {name} </span>
          <span className="font-medium ml-0.5"> ${price}</span>
        </p>
      </div>
    </div>
  );
}
