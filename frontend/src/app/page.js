"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import StorefrontCard from "./components/storefrontCard";
import { authenticatedFetch } from "./components/auth/session.mjs";
import { useContext } from "react";
import { LocaleContext } from "./contexts/localeContext";

export default function Home() {
  const { t } = useContext(LocaleContext);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recent, setRecent] = useState([]);
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_PRODUCT_LIST_URL}?sort=newest&limit=4`).then((response) => response.json()),
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_ORIGIN}/categories`).then((response) => response.json()),
    ]).then(([nextProducts, nextCategories]) => {
      setProducts(nextProducts);
      setCategories(nextCategories);
    }).catch(() => {});
    setRecent(JSON.parse(localStorage.getItem("phone-sine-recent") || "[]").slice(0, 4));
    authenticatedFetch(`${process.env.NEXT_PUBLIC_BACKEND_ORIGIN}/recommendations/personalized`)
      .then((response) => response.ok ? response.json() : [])
      .then((items) => setRecommended(items.slice(0, 4)))
      .catch(() => {});
  }, []);

  return (
    <main className="brand-shell">
      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-[1.08fr_0.92fr] md:items-center lg:py-24">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-neutral-500">PhoneSine Mobile</p>
          <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[0.95] tracking-tight text-neutral-950 md:text-7xl">{t("heroTitle")}</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-neutral-600">{t("heroBody")}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/products" className="brand-button">{t("shopPhones")}</Link>
            <Link href="/products/compare" className="brand-button-outline">{t("compareModels")}</Link>
          </div>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3 text-sm">
            <div className="rounded-2xl border bg-white/70 p-4"><strong className="block text-lg">Live</strong><span className="text-neutral-500">stock sync</span></div>
            <div className="rounded-2xl border bg-white/70 p-4"><strong className="block text-lg">Stripe</strong><span className="text-neutral-500">secure checkout</span></div>
            <div className="rounded-2xl border bg-white/70 p-4"><strong className="block text-lg">Admin</strong><span className="text-neutral-500">ready ops</span></div>
          </div>
        </div>
        <div className="brand-card relative overflow-hidden rounded-[2rem] p-8">
          <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-yellow-300/30 blur-3xl" />
          <div className="absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-neutral-900/10 blur-3xl" />
          <div className="relative mx-auto max-w-sm rounded-[2rem] bg-neutral-950 p-5 text-white shadow-2xl shadow-neutral-900/30">
            <div className="flex items-center justify-between">
              <img src="/brand-mark.svg" alt="" className="h-12 w-12 rounded-2xl" />
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest">Launch ready</span>
            </div>
            <div className="mt-10 rounded-[1.5rem] bg-gradient-to-br from-yellow-200 to-yellow-600 p-1">
              <div className="rounded-[1.25rem] bg-neutral-950/90 p-6">
                <p className="text-sm text-yellow-100">{t("highlights")}</p>
                <dl className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 sm:gap-5">
                  <div><dt className="text-xl font-black sm:text-3xl">{t("live")}</dt><dd className="text-xs text-neutral-300 sm:text-sm">{t("stockAvailability")}</dd></div>
                  <div><dt className="text-xl font-black sm:text-3xl">{t("secure")}</dt><dd className="text-xs text-neutral-300 sm:text-sm">{t("stripeCheckout")}</dd></div>
                  <div><dt className="text-xl font-black sm:text-3xl">{t("tracked")}</dt><dd className="text-xs text-neutral-300 sm:text-sm">{t("orderDelivery")}</dd></div>
                  <div><dt className="text-xl font-black sm:text-3xl">{t("easy")}</dt><dd className="text-xs text-neutral-300 sm:text-sm">{t("returnsSupport")}</dd></div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-neutral-950 py-14 text-white"><div className="mx-auto max-w-7xl px-6"><h2 className="text-2xl font-black">{t("categories")}</h2><div className="mt-6 flex flex-wrap gap-3">{categories.map((category) => <Link key={category.id} href={`/categories/${category.slug}`} className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold backdrop-blur hover:bg-white/20">{category.name}</Link>)}</div></div></section>
      <section className="mx-auto max-w-7xl px-6 py-16"><div className="flex items-end justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.25em] text-neutral-500">{t("justAdded")}</p><h2 className="text-3xl font-black">{t("latest")}</h2></div><Link href="/products" className="font-semibold underline">{t("viewAll")}</Link></div><div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <StorefrontCard key={product.id} product={product} />)}</div></section>
      {recommended.length > 0 && <section className="mx-auto max-w-6xl px-6 py-14"><h2 className="text-2xl font-bold">{t("recommended")}</h2><div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{recommended.map((product) => <StorefrontCard key={product.id} product={product} />)}</div></section>}
      {recent.length > 0 && <section className="mx-auto max-w-6xl px-6 py-14"><h2 className="text-2xl font-bold">{t("recent")}</h2><div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{recent.map((product) => <StorefrontCard key={product.id} product={product} />)}</div></section>}
    </main>
  );
}
