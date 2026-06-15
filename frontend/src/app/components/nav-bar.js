"use client";

import { Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NavList } from "./navItem/navList";
import Auth from "./auth";
import { useContext } from "react";
import { CartContext } from "../contexts/cartContext";
import { LocaleContext } from "../contexts/localeContext";

export default function NavBar() {
  const { itemCount, setIsCartOpen } = useContext(CartContext);
  const { locale, setLocale, t } = useContext(LocaleContext);

  return (
    <nav className="flex flex-wrap items-center gap-4 px-5 pt-5">
      <h1 className="mr-auto flex-none text-2xl font-bold">
        Phone Sine
      </h1>
      <div className="order-3 w-full md:order-none md:w-auto md:flex-auto">
        <NavList />
      </div>
      <div className="flex items-center justify-end">
        <Link href="/saved" aria-label="Wishlist" className="p-2"><Heart className="h-5 w-5" /></Link>
        <Link href="/profile" className="p-2 text-sm">{t("profile")}</Link>
        <Link href="/security" className="p-2 text-sm">{t("security")}</Link>
        <Link href="/support" className="p-2 text-sm">{t("support")}</Link>
        <select aria-label={t("language")} className="rounded border p-1 text-sm" value={locale} onChange={(event) => setLocale(event.target.value)}>
          <option value="en">English</option>
          <option value="my">မြန်မာ</option>
        </select>
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
