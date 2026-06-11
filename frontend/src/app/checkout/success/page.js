"use client";

import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { CartContext } from "../../contexts/cartContext";

export default function CheckoutSuccessPage() {
  const { clearCart } = useContext(CartContext);
  const [result, setResult] = useState({
    status: "loading",
    message: "Verifying your payment...",
  });

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    if (!sessionId) {
      setResult({ status: "error", message: "Missing payment session." });
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_PAYMENT_STATUS_URL}/${sessionId}`)
      .then(async (response) => {
        if (!response.ok) throw new Error(await response.text());
        return response.json();
      })
      .then((payment) => {
        if (!payment.verified) throw new Error("Payment has not been confirmed.");
        clearCart();
        sessionStorage.removeItem("phone-sine-checkout");
        setResult({
          status: "success",
          message: `Payment confirmed for order #${payment.orderId}.`,
        });
      })
      .catch((error) =>
        setResult({ status: "error", message: error.message || "Unable to verify payment." })
      );
  }, []);

  return (
    <main className="mx-auto max-w-2xl px-6 py-20 text-center">
      <h1 className="text-3xl font-bold">
        {result.status === "success" ? "Payment successful" : "Payment verification"}
      </h1>
      <p className="mt-4 text-neutral-600">{result.message}</p>
      <Link href="/products" className="mt-8 inline-block rounded bg-neutral-900 px-6 py-3 text-white">
        Continue shopping
      </Link>
    </main>
  );
}
