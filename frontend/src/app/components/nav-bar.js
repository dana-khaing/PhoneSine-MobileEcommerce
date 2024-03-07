"use client";

import { ShoppingBag, Search } from "lucide-react";
import { NavList } from "./navItem/navList";
import Login from "./login/logInCard";
export default function NavBar({ Searchlistener }) {
  return (
    <nav className="flex justify-between items-center px-[3vw] py-7">
      <h1 className="text-2xl font-bold pr-2 ">Phone Sine</h1>
      <div>
        <NavList />
      </div>
      <div className="flex items-center">
        <input
          className="border border-gray-300 rounded-3xl px-3 py-0 w-32 text-base"
          type="text"
          placeholder="Search"
          onChange={Searchlistener}
        />
        <button className="pl-1 pr-1.5">
          <Search className="w-5 h-5  text-neutral-600 hover:text-black" />
        </button>
        <button className="p-1.5">
          <ShoppingBag className="w-5 h-5  text-neutral-600 hover:text-black" />
        </button>
        <Login />
      </div>
    </nav>
  );
}
