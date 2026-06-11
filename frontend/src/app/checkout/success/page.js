"use client";

import Link from "next/link";
import { useContext, useEffect } from "react";
import { CartContext } from "../../contexts/cartContext";

export default function CheckoutSuccessPage() {
  const { clearCart } = useContext(CartContext);

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    if (sessionId) {
      clearCart();
      sessionStorage.removeItem("phone-sine-checkout");
    }
  }, []);

  return (
    <main className="mx-auto max-w-2xl px-6 py-20 text-center">
      <h1 className="text-3xl font-bold">Payment successful</h1>
      <p className="mt-4 text-neutral-600">Thank you. Your payment was accepted.</p>
      <Link href="/products" className="mt-8 inline-block rounded bg-neutral-900 px-6 py-3 text-white">
        Continue shopping
      </Link>
    </main>
  );
}
