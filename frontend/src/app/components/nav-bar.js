"use client";

import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavList } from "./navItem/navList";
import Auth from "./auth";
import { useContext } from "react";
import { CartContext } from "../contexts/cartContext";

export default function NavBar() {
  const { itemCount, setIsCartOpen } = useContext(CartContext);

  return (
    <nav className=" flex  px-5 pt-5">
      <h1 className=" flex-none text-2xl font-bold pr-2 items-center justify-normal ml-2 w-[33%]">
        Phone Sine
      </h1>
      <div className=" flex-auto w-[33%]">
        <NavList />
      </div>
      <div className="flex items-center justify-end w-[33%]">
        {/* <Button variant="ghost" className=" flex pl-[0.5rem] pr-1.5"></Button> */}
        <Button
          variant="ghost"
          className="relative p-1.5"
          aria-label={`Open cart with ${itemCount} items`}
          onClick={() => setIsCartOpen(true)}
        >
          <ShoppingBag className="w-5 h-5  text-neutral-600 hover:text-black" />
          {itemCount > 0 && (
            <span className="absolute -right-1 -top-1 rounded-full bg-black px-1.5 text-xs text-white">
              {itemCount}
            </span>
          )}
        </Button>
        <Auth />
      </div>
    </nav>
  );
}
