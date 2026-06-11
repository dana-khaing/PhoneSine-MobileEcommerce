"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("Loading orders...");
  const cancelOrder = async (orderId) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_ORDERS_URL}/${orderId}/cancel`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    setMessage(response.ok ? "Cancellation/refund request submitted." : await response.text());
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Sign in to view your orders.");
      return;
    }

    fetch(process.env.NEXT_PUBLIC_API_ORDERS_URL, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(await response.text());
        return response.json();
      })
      .then((data) => {
        setOrders(data);
        setMessage(data.length === 0 ? "No orders yet." : "");
      })
      .catch((error) => setMessage(error.message));
  }, []);

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold">My orders</h1>
      {message && <p className="mt-8 text-neutral-600">{message}</p>}
      <div className="mt-8 space-y-6">
        {orders.map((order) => (
          <article key={order.id} className="rounded-lg border p-6">
            <div className="flex justify-between">
              <h2 className="font-bold">Order #{order.id}</h2>
              <span className="capitalize">{order.status}</span>
            </div>
            <p className="mt-2 text-sm text-neutral-500">
              {new Date(order.createdAt).toLocaleDateString()} · £{(order.totalAmount / 100).toFixed(2)}
            </p>
            <ul className="mt-4 border-t pt-4">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between py-1">
                  <span>{item.name} × {item.quantity}</span>
                  <span>£{((item.unitAmount * item.quantity) / 100).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t pt-4">
              <h3 className="font-semibold">Timeline</h3>
              {order.events?.map((event) => (
                <p key={event.id} className="py-1 text-sm text-neutral-600">
                  {new Date(event.createdAt).toLocaleString()} · {event.message}
                </p>
              ))}
            </div>
            {!["cancelled", "refunded", "partially_refunded"].includes(order.status) && (
              <button onClick={() => cancelOrder(order.id)} className="mt-4 rounded border px-4 py-2">
                Cancel or request refund
              </button>
            )}
          </article>
        ))}
      </div>
      <Link href="/products" className="mt-8 inline-block underline">Continue shopping</Link>
    </main>
  );
}
