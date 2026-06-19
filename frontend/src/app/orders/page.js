"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useContext } from "react";
import { CartContext } from "../contexts/cartContext";
import { authenticatedFetch } from "../components/auth/session.mjs";

const timelineSteps = ["paid", "processing", "shipped", "delivered"];
const stepIndex = (status) => Math.max(0, timelineSteps.indexOf(status));

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("Loading orders...");
  const [returnReasons, setReturnReasons] = useState({});
  const { addItem } = useContext(CartContext);
  const cancelOrder = async (orderId) => {
    const response = await authenticatedFetch(
      `${process.env.NEXT_PUBLIC_API_ORDERS_URL}/${orderId}/cancel`,
      {
        method: "POST",
      }
    );
    setMessage(response.ok ? "Cancellation/refund request submitted." : await response.text());
  };
  const requestReturn = async (orderId) => {
    const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_ORDERS_URL}/${orderId}/returns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: returnReasons[orderId], details: "" }),
    });
    setMessage(response.ok ? "Return request submitted." : await response.text());
  };

  useEffect(() => {
    authenticatedFetch(process.env.NEXT_PUBLIC_API_ORDERS_URL, {
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
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-700">Order tracking</p>
      <h1 className="mt-2 text-3xl font-bold">My orders</h1>
      {message && <p className="mt-8 text-neutral-600">{message}</p>}
      <div className="mt-8 space-y-6">
        {orders.map((order) => (
          <article key={order.id} className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex flex-wrap justify-between gap-3">
              <h2 className="font-bold">Order #{order.id}</h2>
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-sm capitalize">{order.status}</span>
            </div>
            <p className="mt-2 text-sm text-neutral-500">
              {new Date(order.createdAt).toLocaleDateString()} · {(order.currency || "gbp").toUpperCase()} {(order.totalAmount / 100).toFixed(2)}
            </p>
            <div className="mt-5 grid gap-2 sm:grid-cols-4">
              {timelineSteps.map((step, index) => {
                const done = stepIndex(order.status) >= index;
                return <div key={step} className={`rounded-xl border p-3 text-sm ${done ? "border-neutral-900 bg-neutral-950 text-white" : "bg-neutral-50 text-neutral-500"}`}>{done ? "Done" : "Next"} · <span className="capitalize">{step}</span></div>;
              })}
            </div>
            <ul className="mt-4 border-t pt-4">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between py-1">
                  <span>{item.name} × {item.quantity}</span>
                  <span>£{((item.unitAmount * item.quantity) / 100).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            {order.refunds?.length > 0 && (
              <div className="mt-4 border-t pt-4 text-sm">
                <h3 className="font-semibold">Refunds</h3>
                {order.refunds.map((refund) => (
                  <p key={refund.id}>{refund.currency.toUpperCase()} {(refund.amount / 100).toFixed(2)} · {refund.status}</p>
                ))}
              </div>
            )}
            <div className="mt-4 border-t pt-4">
              <h3 className="font-semibold">Timeline</h3>
              <div className="mt-3 space-y-3">
                {order.events?.length ? order.events.map((event) => (
                  <p key={event.id} className="border-l-2 border-neutral-900 pl-3 text-sm text-neutral-600">
                    <span className="block font-semibold text-neutral-900">{new Date(event.createdAt).toLocaleString()}</span>
                    {event.message}
                  </p>
                )) : <p className="text-sm text-neutral-500">We will add timeline events as checkout, shipping, return, and refund updates happen.</p>}
              </div>
            </div>
            <a className="mt-4 inline-block rounded border px-4 py-2" href={`${process.env.NEXT_PUBLIC_API_ORDERS_URL}/${order.id}/invoice`} onClick={async (event) => {
              event.preventDefault();
              const response = await authenticatedFetch(event.currentTarget.href);
              const url = URL.createObjectURL(await response.blob());
              const link = document.createElement("a"); link.href = url; link.download = `order-${order.id}.pdf`; link.click(); URL.revokeObjectURL(url);
            }}>Download invoice</a>
            <button className="ml-2 mt-4 rounded border px-4 py-2" onClick={() => order.items.forEach((item) => addItem({ id: item.productId, variantId: item.variantId, name: item.name, price: item.unitAmount / 100 }))}>Reorder</button>
            {order.returnRequest && <p className="mt-4 rounded bg-neutral-100 p-3">Return: {order.returnRequest.status}{order.returnRequest.returnTrackingNumber ? ` · ${order.returnRequest.returnTrackingNumber}` : ""}</p>}
            {order.shipment && <p className="mt-4 rounded bg-neutral-100 p-3">Shipment: {order.shipment.carrier} · {order.shipment.status} · {order.shipment.trackingNumber}</p>}
            {order.status === "delivered" && !order.returnRequest && <div className="mt-4 flex gap-2"><input className="rounded border p-2" placeholder="Return reason" value={returnReasons[order.id] || ""} onChange={(event) => setReturnReasons((current) => ({ ...current, [order.id]: event.target.value }))} /><button className="rounded border px-4 py-2" onClick={() => requestReturn(order.id)}>Request return</button></div>}
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
