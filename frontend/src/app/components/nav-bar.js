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
    <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-5 sm:px-5">
      <Link href="/" className="mr-auto flex flex-none items-center gap-3">
        <img src="/brand-mark.svg" alt="" className="h-11 w-11 rounded-2xl shadow-sm" />
        <span>
          <span className="block text-2xl font-black tracking-tight">PhoneSine</span>
          <span className="block text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500">Mobile Store</span>
        </span>
      </Link>
      <div className="order-3 w-full md:order-none md:w-auto md:flex-auto">
        <NavList />
      </div>
      <div className="flex w-full flex-wrap items-center justify-between gap-1 rounded-3xl border bg-white/80 p-1 shadow-sm sm:w-auto sm:justify-end sm:rounded-full">
        <Link href="/saved" aria-label="Wishlist" className="rounded-full p-2 hover:bg-neutral-100"><Heart className="h-5 w-5" /></Link>
        <Link href="/profile" className="rounded-full px-3 py-2 text-sm font-medium hover:bg-neutral-100">{t("profile")}</Link>
        <Link href="/security" className="rounded-full px-3 py-2 text-sm font-medium hover:bg-neutral-100">{t("security")}</Link>
        <Link href="/support" className="rounded-full px-3 py-2 text-sm font-medium hover:bg-neutral-100">{t("support")}</Link>
        <Link href="/status" className="rounded-full px-3 py-2 text-sm font-medium hover:bg-neutral-100">Status</Link>
        <select aria-label={t("language")} className="rounded-full border border-neutral-200 bg-white px-2 py-1 text-sm" value={locale} onChange={(event) => setLocale(event.target.value)}>
          <option value="en">English</option>
          <option value="my">မြန်မာ</option>
        </select>
        {/* <Button variant="ghost" className=" flex pl-[0.5rem] pr-1.5"></Button> */}
        <Button
          variant="ghost"
          className="relative rounded-full p-2"
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
