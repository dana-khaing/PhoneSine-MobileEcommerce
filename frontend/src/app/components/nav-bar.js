"use client";

import { ShoppingBag, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavList } from "./navItem/navList";
import Auth from "./auth";

export default function NavBar({ Searchlistener }) {
  return (
    <nav className=" flex  px-5 pt-5">
      <h1 className=" flex-none text-2xl font-bold pr-2 items-center justify-normal ml-2 w-[33%]">
        Phone Sine
      </h1>
      <div className=" flex-auto w-[33%]">
        <NavList />
      </div>
      <div className="flex items-center justify-end w-[33%]">
        <input
          className="border border-gray-300 rounded-3xl px-3 py-0 w-32 text-base"
          type="text"
          placeholder="Search"
          onChange={Searchlistener}
        />
        <Button variant="ghost" className=" flex pl-[0.5rem] pr-1.5">
          <Search className="w-5 h-5  text-neutral-600 hover:text-black" />
        </Button>
        <Button variant="ghost" className="p-1.5">
          <ShoppingBag className="w-5 h-5  text-neutral-600 hover:text-black" />
        </Button>
        <Auth />
      </div>
    </nav>
  );
}
