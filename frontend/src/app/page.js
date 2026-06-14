"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import StorefrontCard from "./components/storefrontCard";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_PRODUCT_LIST_URL}?sort=newest&limit=4`).then((response) => response.json()),
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_ORIGIN}/categories`).then((response) => response.json()),
    ]).then(([nextProducts, nextCategories]) => {
      setProducts(nextProducts);
      setCategories(nextCategories);
    }).catch(() => {});
  }, []);

  return (
    <main>
      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-20 md:grid-cols-2 md:items-center">
        <div><p className="text-sm font-semibold uppercase tracking-widest text-neutral-500">Phone Sine Mobile</p><h1 className="mt-4 text-5xl font-bold leading-tight">Find the right phone without the guesswork.</h1><p className="mt-5 max-w-xl text-lg text-neutral-600">Browse current stock, compare specifications, and check out securely with tracked delivery.</p><div className="mt-8 flex gap-3"><Link href="/products" className="rounded bg-neutral-900 px-5 py-3 text-white">Shop phones</Link><Link href="/products/compare" className="rounded border px-5 py-3">Compare models</Link></div></div>
        <div className="rounded-3xl bg-neutral-100 p-10"><p className="text-sm text-neutral-500">Store highlights</p><dl className="mt-5 grid grid-cols-2 gap-5"><div><dt className="text-3xl font-bold">Live</dt><dd>stock availability</dd></div><div><dt className="text-3xl font-bold">Secure</dt><dd>Stripe checkout</dd></div><div><dt className="text-3xl font-bold">Tracked</dt><dd>order delivery</dd></div><div><dt className="text-3xl font-bold">Easy</dt><dd>returns support</dd></div></dl></div>
      </section>
      <section className="bg-neutral-100 py-14"><div className="mx-auto max-w-6xl px-6"><h2 className="text-2xl font-bold">Shop by category</h2><div className="mt-6 flex flex-wrap gap-3">{categories.map((category) => <Link key={category.id} href={`/categories/${category.slug}`} className="rounded-full border bg-white px-5 py-3">{category.name}</Link>)}</div></div></section>
      <section className="mx-auto max-w-6xl px-6 py-14"><div className="flex items-end justify-between"><div><p className="text-sm uppercase tracking-wide text-neutral-500">Just added</p><h2 className="text-2xl font-bold">Latest products</h2></div><Link href="/products" className="underline">View all</Link></div><div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <StorefrontCard key={product.id} product={product} />)}</div></section>
    </main>
  );
}
