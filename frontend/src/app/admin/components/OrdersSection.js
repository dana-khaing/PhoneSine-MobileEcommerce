import { useState } from "react";

const matchesOrder = (order, query) => {
  if (!query) return true;
  const normalized = query.toLowerCase();
  return [order.id, order.email, order.status, order.trackingNumber]
    .some((value) => String(value || "").toLowerCase().includes(normalized));
};

export default function OrdersSection({ action, orders, query }) {
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [tracking, setTracking] = useState({});
  const [refunds, setRefunds] = useState({});
  const visibleOrders = orders
    .filter((order) => orderStatusFilter === "all" || order.status === orderStatusFilter)
    .filter((order) => matchesOrder(order, query));
  const orderStatuses = ["all", ...Array.from(new Set(orders.map((order) => order.status).filter(Boolean)))];

  return (
    <section id="orders" className="space-y-5">
      <div className="rounded border p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-xl font-bold">Orders</h2><p className="text-sm text-neutral-500">{visibleOrders.length} of {orders.length} orders shown</p></div>
          <select className="rounded border px-3 py-2" aria-label="Filter orders by status" value={orderStatusFilter} onChange={(event) => setOrderStatusFilter(event.target.value)}>
            {orderStatuses.map((status) => <option key={status} value={status}>{status === "all" ? "All statuses" : status}</option>)}
          </select>
        </div>
      </div>
      {visibleOrders.map((order) => <article key={order.id} className="rounded border p-5">
        <div className="flex justify-between"><strong>Order #{order.id}</strong><span>{order.status}</span></div>
        <p>{order.email} · {(order.currency || "gbp").toUpperCase()} {(order.totalAmount / 100).toFixed(2)}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <input className="rounded border p-2" placeholder="Carrier" value={tracking[order.id]?.carrier || ""} onChange={(event) => setTracking((current) => ({ ...current, [order.id]: { ...current[order.id], carrier: event.target.value } }))} />
          <input className="rounded border p-2" placeholder="Tracking number" value={tracking[order.id]?.trackingNumber || ""} onChange={(event) => setTracking((current) => ({ ...current, [order.id]: { ...current[order.id], trackingNumber: event.target.value } }))} />
          <input className="rounded border p-2" type="number" min="1" placeholder="Partial refund in smallest currency unit" value={refunds[order.id] || ""} onChange={(event) => setRefunds((current) => ({ ...current, [order.id]: event.target.value }))} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {["processing", "shipped", "delivered"].map((status) => <button key={status} className="rounded border px-3 py-2" onClick={() => action(`/orders/${order.id}/fulfillment`, "PATCH", { status, ...tracking[order.id] })}>{status}</button>)}
          <button className="rounded border px-3 py-2" onClick={() => action(`/orders/${order.id}/refund`, "POST", refunds[order.id] ? { amount: Number(refunds[order.id]) } : {})}>Refund</button>
          <button className="rounded border px-3 py-2" onClick={() => action(`/shipping/orders/${order.id}`, "POST", { carrier: tracking[order.id]?.carrier || "PhoneSine Shipping", service: "standard" })}>Create shipping label</button>
        </div>
        {order.refunds?.map((refund) => <p key={refund.id} className="mt-2 text-sm">Refund {refund.stripeRefundId}: {refund.amount} · {refund.status}</p>)}
      </article>)}
    </section>
  );
}
