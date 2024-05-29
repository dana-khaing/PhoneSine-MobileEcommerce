"use client";

import { ShoppingBag, Search } from "lucide-react";
import { NavList } from "./navItem/navList";
import Auth from "./auth";

export default function NavBar({ Searchlistener }) {
  return (
    <nav className=" flex  px-5 py-7">
      <h1 className=" flex-none text-2xl font-bold pr-2 items-center justify-normal ml-2">
        Phone Sine
      </h1>
      <div className=" flex-auto">
        <NavList />
      </div>
      <div className="flex items-center">
        <input
          className="border border-gray-300 rounded-3xl px-3 py-0 w-32 text-base"
          type="text"
          placeholder="Search"
          onChange={Searchlistener}
        />
        <button className=" flex pl-[0.5rem] pr-1.5">
          <Search className="w-5 h-5  text-neutral-600 hover:text-black" />
        </button>
        <button className="p-1.5">
          <ShoppingBag className="w-5 h-5  text-neutral-600 hover:text-black" />
        </button>
        <Auth />
      </div>
    </nav>
  );
}
