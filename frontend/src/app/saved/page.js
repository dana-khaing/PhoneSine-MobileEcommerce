"use client";

import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { CartContext } from "../contexts/cartContext";

export default function SavedPage() {
  const [wishlist, setWishlist] = useState([]);
  const [message, setMessage] = useState("");
  const { loadSavedCart } = useContext(CartContext);
  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
  const loadWishlist = () => fetch(`${process.env.NEXT_PUBLIC_API_SAVED_URL}/wishlist`, { headers: headers() })
    .then(async (response) => {
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    }).then(setWishlist).catch((error) => setMessage(error.message));
  useEffect(loadWishlist, []);
  const remove = async (id) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_SAVED_URL}/wishlist/${id}`, { method: "DELETE", headers: headers() });
    loadWishlist();
  };
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold">Saved items</h1>
      <button className="mt-5 rounded border px-4 py-2" onClick={() => loadSavedCart().then(() => setMessage("Saved cart loaded.")).catch((error) => setMessage(error.message))}>Load saved cart</button>
      {message && <p className="mt-4">{message}</p>}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {wishlist.map((item) => (
          <article key={item.id} className="rounded border p-4">
            <Link className="font-semibold underline" href={`/products/${item.productId}`}>{item.product?.name}</Link>
            {item.variant && <p className="text-sm text-neutral-500">{item.variant.name}</p>}
            <button className="mt-3 rounded border px-3 py-1" onClick={() => remove(item.id)}>Remove</button>
          </article>
        ))}
      </div>
    </main>
  );
}
