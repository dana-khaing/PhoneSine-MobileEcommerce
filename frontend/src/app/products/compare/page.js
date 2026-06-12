"use client";
import { useState } from "react";
export default function CompareProductsPage() {
  const [ids, setIds] = useState("");
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const compare = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_LIST_URL}/compare?ids=${encodeURIComponent(ids)}`);
    if (!response.ok) return setMessage(await response.text());
    setProducts(await response.json()); setMessage("");
  };
  return <main className="mx-auto max-w-6xl px-6 py-12"><h1 className="text-3xl font-bold">Compare products</h1><div className="mt-5 flex gap-2"><input className="flex-1 rounded border p-2" placeholder="Enter 2-4 product IDs, e.g. 1,2" value={ids} onChange={(event) => setIds(event.target.value)} /><button className="rounded border px-4" onClick={compare}>Compare</button></div>{message && <p className="mt-4">{message}</p>}<div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{products.map((product) => <article key={product.id} className="rounded border p-4"><h2 className="font-bold">{product.name}</h2><p>{product.brand} · £{product.price.toFixed(2)}</p><dl className="mt-4">{Object.entries(product.specifications || {}).map(([key, value]) => <div key={key} className="border-t py-2"><dt className="font-semibold">{key}</dt><dd>{String(value)}</dd></div>)}</dl></article>)}</div></main>;
}
