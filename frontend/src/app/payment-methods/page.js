"use client";

import { useEffect, useState } from "react";

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState([]);
  const [message, setMessage] = useState("Loading saved payment methods...");
  const api = process.env.NEXT_PUBLIC_API_PAYMENT_METHODS_URL;
  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

  const load = () =>
    fetch(api, { headers: headers() })
      .then(async (response) => {
        if (!response.ok) throw new Error(await response.text());
        return response.json();
      })
      .then((data) => {
        setMethods(data);
        setMessage(data.length ? "" : "No saved payment methods.");
      })
      .catch((error) => setMessage(error.message));

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    const response = await fetch(`${api}/${id}`, { method: "DELETE", headers: headers() });
    setMessage(response.ok ? "Payment method removed." : await response.text());
    await load();
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold">Saved payment methods</h1>
      <p className="mt-2 text-neutral-500">Cards are securely stored by Stripe after consent during checkout.</p>
      {message && <p className="my-5">{message}</p>}
      <div className="space-y-3">
        {methods.map((method) => (
          <div key={method.id} className="flex items-center justify-between rounded border p-4">
            <span>{method.card?.brand} ending {method.card?.last4} · expires {method.card?.exp_month}/{method.card?.exp_year}</span>
            <button className="rounded border px-3 py-2" onClick={() => remove(method.id)}>Remove</button>
          </div>
        ))}
      </div>
    </main>
  );
}
