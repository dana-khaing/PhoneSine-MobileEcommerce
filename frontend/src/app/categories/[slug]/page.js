"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import StorefrontCard from "../../components/storefrontCard";

export default function CategoryPage({ params }) {
  const { slug } = use(params);
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("Loading category...");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_ORIGIN}/categories`)
      .then((response) => response.json())
      .then(async (categories) => {
        const match = categories.find((candidate) => candidate.slug === slug);
        if (!match) throw new Error("Category not found");
        setCategory(match);
        const response = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_LIST_URL}?categoryId=${match.id}&limit=50&sort=name`);
        if (!response.ok) throw new Error("Unable to load category products");
        setProducts(await response.json());
        setMessage("");
      })
      .catch((error) => setMessage(error.message));
  }, [slug]);

  return <main className="mx-auto max-w-6xl px-6 py-12"><Link href="/products" className="text-sm underline">All products</Link><h1 className="mt-4 text-4xl font-bold">{category?.name || "Category"}</h1>{message && <p className="mt-4">{message}</p>}<div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <StorefrontCard key={product.id} product={product} />)}</div></main>;
}
