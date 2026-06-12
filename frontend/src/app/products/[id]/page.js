"use client";

import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { CartContext } from "../../contexts/cartContext";

export default function ProductDetailPage({ params }) {
  const [product, setProduct] = useState(null);
  const [message, setMessage] = useState("Loading product...");
  const { addItem } = useContext(CartContext);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_PRODUCT_LIST_URL}/${params.id}`)
      .then(async (response) => {
        if (!response.ok) throw new Error(await response.text());
        return response.json();
      })
      .then((data) => {
        setProduct(data);
        setMessage("");
      })
      .catch((error) => setMessage(error.message));
  }, [params.id]);

  if (!product) return <main className="mx-auto max-w-5xl px-6 py-20">{message}</main>;

  return (
    <main className="mx-auto grid max-w-5xl gap-10 px-6 py-12 md:grid-cols-2">
      <div className="flex min-h-96 items-center justify-center rounded bg-neutral-100">
        <img src="/iph15-pro.jpeg" alt={product.name} className="max-h-80" />
      </div>
      <section>
        <Link href="/products" className="text-sm underline">Back to products</Link>
        <p className="mt-8 text-sm uppercase tracking-wide text-neutral-500">{product.brand}</p>
        <h1 className="mt-2 text-4xl font-bold">{product.name}</h1>
        <p className="mt-5 text-neutral-600">{product.description || "No product description available."}</p>
        <p className="mt-8 text-2xl font-bold">£{product.price.toFixed(2)}</p>
        <p className="mt-2 text-sm">{product.availableStock > 0 ? `${product.availableStock} available` : "Out of stock"}</p>
        <button disabled={product.availableStock === 0} onClick={() => addItem(product)} className="mt-8 rounded bg-neutral-900 px-6 py-3 text-white disabled:opacity-40">Add to cart</button>
      </section>
    </main>
  );
}
