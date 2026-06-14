"use client";

import { useEffect, useState } from "react";

export default function CompareProductsPage() {
  const [catalogue, setCatalogue] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_PRODUCT_LIST_URL}?limit=50&sort=name`)
      .then((response) => response.json())
      .then(setCatalogue)
      .catch(() => setMessage("Unable to load products"));
  }, []);

  const toggle = (id) => {
    setSelectedIds((current) => current.includes(id)
      ? current.filter((candidate) => candidate !== id)
      : current.length < 4 ? [...current, id] : current);
  };
  const compare = async () => {
    if (selectedIds.length < 2) return setMessage("Select between 2 and 4 products");
    const response = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_LIST_URL}/compare?ids=${selectedIds.join(",")}`);
    if (!response.ok) return setMessage(await response.text());
    setProducts(await response.json());
    setMessage("");
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold">Compare products</h1>
      <p className="mt-3 text-neutral-600">Select between two and four products to compare prices and specifications.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {catalogue.map((product) => <label key={product.id} className={`cursor-pointer rounded border p-4 ${selectedIds.includes(product.id) ? "border-neutral-900 bg-neutral-100" : ""}`}><input type="checkbox" className="mr-2" checked={selectedIds.includes(product.id)} onChange={() => toggle(product.id)} />{product.name}<span className="mt-1 block text-sm text-neutral-500">{product.brand} · £{product.price.toFixed(2)}</span></label>)}
      </div>
      <button className="mt-5 rounded bg-neutral-900 px-5 py-3 text-white disabled:opacity-40" disabled={selectedIds.length < 2} onClick={compare}>Compare {selectedIds.length || ""} products</button>
      {message && <p className="mt-4">{message}</p>}
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{products.map((product) => <article key={product.id} className="rounded border p-4"><h2 className="font-bold">{product.name}</h2><p>{product.brand} · £{product.price.toFixed(2)}</p><dl className="mt-4">{Object.entries(product.specifications || {}).map(([key, value]) => <div key={key} className="border-t py-2"><dt className="font-semibold">{key}</dt><dd>{String(value)}</dd></div>)}</dl></article>)}</div>
    </main>
  );
}
