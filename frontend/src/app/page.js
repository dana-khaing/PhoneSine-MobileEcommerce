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
    <main>
      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-20 md:grid-cols-2 md:items-center">
        <div><p className="text-sm font-semibold uppercase tracking-widest text-neutral-500">Phone Sine Mobile</p><h1 className="mt-4 text-5xl font-bold leading-tight">{t("heroTitle")}</h1><p className="mt-5 max-w-xl text-lg text-neutral-600">{t("heroBody")}</p><div className="mt-8 flex gap-3"><Link href="/products" className="rounded bg-neutral-900 px-5 py-3 text-white">{t("shopPhones")}</Link><Link href="/products/compare" className="rounded border px-5 py-3">{t("compareModels")}</Link></div></div>
        <div className="rounded-3xl bg-neutral-100 p-10"><p className="text-sm text-neutral-500">{t("highlights")}</p><dl className="mt-5 grid grid-cols-2 gap-5"><div><dt className="text-3xl font-bold">{t("live")}</dt><dd>{t("stockAvailability")}</dd></div><div><dt className="text-3xl font-bold">{t("secure")}</dt><dd>{t("stripeCheckout")}</dd></div><div><dt className="text-3xl font-bold">{t("tracked")}</dt><dd>{t("orderDelivery")}</dd></div><div><dt className="text-3xl font-bold">{t("easy")}</dt><dd>{t("returnsSupport")}</dd></div></dl></div>
      </section>
      <section className="bg-neutral-100 py-14"><div className="mx-auto max-w-6xl px-6"><h2 className="text-2xl font-bold">{t("categories")}</h2><div className="mt-6 flex flex-wrap gap-3">{categories.map((category) => <Link key={category.id} href={`/categories/${category.slug}`} className="rounded-full border bg-white px-5 py-3">{category.name}</Link>)}</div></div></section>
      <section className="mx-auto max-w-6xl px-6 py-14"><div className="flex items-end justify-between"><div><p className="text-sm uppercase tracking-wide text-neutral-500">{t("justAdded")}</p><h2 className="text-2xl font-bold">{t("latest")}</h2></div><Link href="/products" className="underline">{t("viewAll")}</Link></div><div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <StorefrontCard key={product.id} product={product} />)}</div></section>
      {recommended.length > 0 && <section className="mx-auto max-w-6xl px-6 py-14"><h2 className="text-2xl font-bold">{t("recommended")}</h2><div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{recommended.map((product) => <StorefrontCard key={product.id} product={product} />)}</div></section>}
      {recent.length > 0 && <section className="mx-auto max-w-6xl px-6 py-14"><h2 className="text-2xl font-bold">{t("recent")}</h2><div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{recent.map((product) => <StorefrontCard key={product.id} product={product} />)}</div></section>}
    </main>
  );
}
