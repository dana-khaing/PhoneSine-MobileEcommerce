"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [tracking, setTracking] = useState({});
  const [refunds, setRefunds] = useState({});
  const [health, setHealth] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [promotion, setPromotion] = useState({ code: "", percentOff: 10, maxUses: 100, perCustomerLimit: 1 });
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("Loading admin orders...");
  const api = process.env.NEXT_PUBLIC_API_ADMIN_URL;
  const headers = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const loadOrders = () =>
    fetch(`${api}/orders`, { headers: headers() })
      .then(async (response) => {
        if (!response.ok) throw new Error(await response.text());
        return response.json();
      })
      .then((data) => {
        setOrders(data);
        setMessage("");
      })
      .catch((error) => setMessage(error.message));

  const loadProducts = () =>
    fetch(`${api}/products`, { headers: headers() })
      .then((response) => response.json())
      .then(setProducts);

  const loadHealth = () =>
    fetch(`${api}/health/payments`, { headers: headers() })
      .then((response) => response.json())
      .then(setHealth);
  const loadPromotions = () =>
    fetch(`${api}/promotions`, { headers: headers() })
      .then((response) => response.json())
      .then(setPromotions);
  const loadUsers = () =>
    fetch(`${api}/users`, { headers: headers() })
      .then((response) => response.json())
      .then(setUsers);

  useEffect(() => {
    loadOrders();
    loadProducts();
    loadHealth();
    loadPromotions();
    loadUsers();
  }, []);

  const action = async (path, method = "POST", body) => {
    const response = await fetch(`${api}${path}`, {
      method,
      headers: headers(),
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    setMessage(response.ok ? "Admin action completed." : await response.text());
    await loadOrders();
    await loadProducts();
    await loadHealth();
    await loadPromotions();
    await loadUsers();
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold">Commerce admin</h1>
      <div className="my-6 flex flex-wrap gap-3">
        <button className="rounded border px-4 py-2" onClick={() => action("/cleanup")}>Clean abandoned orders</button>
        <button className="rounded border px-4 py-2" onClick={() => action("/notifications/deliver")}>Deliver notifications</button>
        <button className="rounded border px-4 py-2" onClick={() => action("/reconcile")}>Reconcile payments</button>
      </div>
      {health && <p className="my-4">Payment health: {health.pending} pending · {health.reviews} reviews · {health.disputes} disputes · {health.failedNotifications} failed notifications</p>}
      {message && <p className="my-4">{message}</p>}
      <section className="mb-8 rounded border p-5">
        <h2 className="text-xl font-bold">Inventory</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {products.map((product) => (
            <div key={product.id} className="flex items-center justify-between gap-3 border p-3">
              <span>{product.name} · {product.stockQuantity} stock / {product.reservedQuantity} reserved</span>
              <button className="rounded border px-3 py-1" onClick={() => action(`/products/${product.id}`, "PATCH", { stockQuantity: product.stockQuantity + 5 })}>+5 stock</button>
            </div>
          ))}
        </div>
      </section>
      <section className="mb-8 rounded border p-5">
        <h2 className="text-xl font-bold">Promotions</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {["code", "percentOff", "maxUses", "perCustomerLimit"].map((field) => (
            <input key={field} className="rounded border p-2" type={field === "code" ? "text" : "number"} placeholder={field} value={promotion[field]} onChange={(event) => setPromotion((current) => ({ ...current, [field]: event.target.value }))} />
          ))}
          <button className="rounded border px-3 py-2" onClick={() => action("/promotions", "POST", promotion)}>Create promotion</button>
        </div>
        {promotions.map((item) => <p key={item.id} className="mt-2 text-sm">{item.code}: {item.percentOff}% · {item.useCount}/{item.maxUses || "unlimited"} uses</p>)}
      </section>
      <section className="mb-8 rounded border p-5">
        <h2 className="text-xl font-bold">User roles</h2>
        {users.map((user) => (
          <div key={user.id} className="mt-3 flex items-center justify-between border p-3">
            <span>{user.email} · {user.role} · {user.emailVerifiedAt ? "verified" : "unverified"}</span>
            <button className="rounded border px-3 py-2" onClick={() => action(`/users/${user.id}/role`, "PATCH", { role: user.role === "admin" ? "customer" : "admin" })}>
              Make {user.role === "admin" ? "customer" : "admin"}
            </button>
          </div>
        ))}
      </section>
      <div className="space-y-5">
        {orders.map((order) => (
          <article key={order.id} className="rounded border p-5">
            <div className="flex justify-between"><strong>Order #{order.id}</strong><span>{order.status}</span></div>
            <p>{order.email} · {(order.currency || "gbp").toUpperCase()} {(order.totalAmount / 100).toFixed(2)}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <input className="rounded border p-2" placeholder="Carrier" value={tracking[order.id]?.carrier || ""} onChange={(event) => setTracking((current) => ({ ...current, [order.id]: { ...current[order.id], carrier: event.target.value } }))} />
              <input className="rounded border p-2" placeholder="Tracking number" value={tracking[order.id]?.trackingNumber || ""} onChange={(event) => setTracking((current) => ({ ...current, [order.id]: { ...current[order.id], trackingNumber: event.target.value } }))} />
              <input className="rounded border p-2" type="number" min="1" placeholder="Partial refund in smallest currency unit" value={refunds[order.id] || ""} onChange={(event) => setRefunds((current) => ({ ...current, [order.id]: event.target.value }))} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {["processing", "shipped", "delivered"].map((status) => (
                <button key={status} className="rounded border px-3 py-2" onClick={() => action(`/orders/${order.id}/fulfillment`, "PATCH", { status, ...tracking[order.id] })}>{status}</button>
              ))}
              <button className="rounded border px-3 py-2" onClick={() => action(`/orders/${order.id}/refund`, "POST", refunds[order.id] ? { amount: Number(refunds[order.id]) } : {})}>Refund</button>
            </div>
            {order.refunds?.map((refund) => <p key={refund.id} className="mt-2 text-sm">Refund {refund.stripeRefundId}: {refund.amount} · {refund.status}</p>)}
          </article>
        ))}
      </div>
    </main>
  );
}
