"use client";

import { useEffect, useState } from "react";
import { authenticatedFetch } from "../components/auth/session.mjs";

export default function AdminPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [variantForm, setVariantForm] = useState({ productId: "", sku: "", name: "", priceAmount: "", stockQuantity: "", options: "{}" });
  const [tracking, setTracking] = useState({});
  const [refunds, setRefunds] = useState({});
  const [health, setHealth] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [promotion, setPromotion] = useState({ code: "", percentOff: 10, maxUses: 100, perCustomerLimit: 1 });
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [returns, setReturns] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [ticketReplies, setTicketReplies] = useState({});
  const [giftCards, setGiftCards] = useState([]);
  const [giftCard, setGiftCard] = useState({ balanceAmount: "", currency: "gbp", expiresAt: "" });
  const [bundles, setBundles] = useState([]);
  const [bundle, setBundle] = useState({ name: "", description: "", priceAmount: "", items: "[]" });
  const emptyProduct = { name: "", brand: "", description: "", priceAmount: "", stockQuantity: "", categoryId: "", specifications: "{}", allowBackorder: false, preorderDate: "" };
  const [productForm, setProductForm] = useState(emptyProduct);
  const [editingProductId, setEditingProductId] = useState(null);
  const [message, setMessage] = useState("Loading admin orders...");
  const api = process.env.NEXT_PUBLIC_API_ADMIN_URL;
  const headers = () => ({
    "Content-Type": "application/json",
  });

  const loadOrders = () =>
    authenticatedFetch(`${api}/orders`, { headers: headers() })
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
    authenticatedFetch(`${api}/products`, { headers: headers() })
      .then((response) => response.json())
      .then(setProducts);
  const loadCategories = () =>
    authenticatedFetch(`${api}/categories`, { headers: headers() })
      .then((response) => response.json())
      .then(setCategories);

  const loadHealth = () =>
    authenticatedFetch(`${api}/health/payments`, { headers: headers() })
      .then((response) => response.json())
      .then(setHealth);
  const loadPromotions = () =>
    authenticatedFetch(`${api}/promotions`, { headers: headers() })
      .then((response) => response.json())
      .then(setPromotions);
  const loadUsers = () =>
    authenticatedFetch(`${api}/users`, { headers: headers() })
      .then((response) => response.json())
      .then(setUsers);
  const loadReviews = () => authenticatedFetch(`${api}/reviews`, { headers: headers() }).then((response) => response.json()).then(setReviews);
  const loadReturns = () => authenticatedFetch(`${api}/returns`, { headers: headers() }).then((response) => response.json()).then(setReturns);
  const loadAnalytics = () => authenticatedFetch(`${api}/analytics`, { headers: headers() }).then((response) => response.json()).then(setAnalytics);
  const loadTickets = () => authenticatedFetch(`${api}/tickets`, { headers: headers() }).then((response) => response.json()).then(setTickets);
  const loadGiftCards = () => authenticatedFetch(`${api}/gift-cards`, { headers: headers() }).then((response) => response.json()).then(setGiftCards);
  const loadBundles = () => authenticatedFetch(`${api}/bundles`, { headers: headers() }).then((response) => response.json()).then(setBundles);

  useEffect(() => {
    loadOrders();
    loadProducts();
    loadCategories();
    loadHealth();
    loadPromotions();
    loadUsers();
    loadReviews();
    loadReturns();
    loadAnalytics();
    loadTickets();
    loadGiftCards();
    loadBundles();
  }, []);

  const action = async (path, method = "POST", body) => {
    const response = await authenticatedFetch(`${api}${path}`, {
      method,
      headers: headers(),
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    setMessage(response.ok ? "Admin action completed." : await response.text());
    await loadOrders();
    await loadProducts();
    await loadCategories();
    await loadHealth();
    await loadPromotions();
    await loadUsers();
    await loadReviews();
    await loadReturns();
    await loadAnalytics();
    await loadTickets();
    await loadGiftCards();
    await loadBundles();
  };

  const importProducts = async (file) => {
    if (!file) return;
    const response = await authenticatedFetch(`${api}/products-import.csv`, {
      method: "POST",
      headers: { "Content-Type": "text/csv" },
      body: await file.text(),
    });
    setMessage(response.ok ? `${(await response.json()).imported} products imported.` : await response.text());
    await loadProducts();
  };

  const download = async (path, filename) => {
    const response = await authenticatedFetch(`${api}${path}`);
    if (!response.ok) return setMessage(await response.text());
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const createBundle = async () => {
    try {
      await action("/bundles", "POST", { ...bundle, priceAmount: Number(bundle.priceAmount), items: JSON.parse(bundle.items) });
      setBundle({ name: "", description: "", priceAmount: "", items: "[]" });
    } catch {
      setMessage("Bundle items must be valid JSON.");
    }
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    await action(
      editingProductId ? `/products/${editingProductId}` : "/products",
      editingProductId ? "PATCH" : "POST",
      {
        ...productForm,
        priceAmount: Number(productForm.priceAmount),
        stockQuantity: Number(productForm.stockQuantity),
        categoryId: productForm.categoryId || null,
        specifications: productForm.specifications,
        allowBackorder: productForm.allowBackorder,
        preorderDate: productForm.preorderDate || null,
      }
    );
    setProductForm(emptyProduct);
    setEditingProductId(null);
  };

  const editProduct = (product) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      brand: product.brand,
      description: product.description || "",
      priceAmount: product.priceAmount,
      stockQuantity: product.stockQuantity,
      categoryId: product.categoryId || "",
      specifications: JSON.stringify(product.specifications || {}, null, 2),
      allowBackorder: product.allowBackorder,
      preorderDate: product.preorderDate?.slice(0, 10) || "",
    });
  };

  const saveVariant = async (event) => {
    event.preventDefault();
    await action(`/products/${variantForm.productId}/variants`, "POST", {
      ...variantForm,
      priceAmount: Number(variantForm.priceAmount),
      stockQuantity: Number(variantForm.stockQuantity),
    });
    setVariantForm({ productId: "", sku: "", name: "", priceAmount: "", stockQuantity: "", options: "{}" });
  };

  const uploadImage = async (productId, file) => {
    if (!file) return;
    const response = await authenticatedFetch(`${api}/products/${productId}/images`, {
      method: "POST",
      headers: {
        "Content-Type": file.type,
        "X-Alt-Text": file.name,
      },
      body: file,
    });
    setMessage(response.ok ? "Product image uploaded." : await response.text());
    await loadProducts();
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
      {analytics && <div className="my-4 rounded border p-4"><strong>Operations:</strong> {analytics.orders} orders · £{(analytics.revenue / 100).toFixed(2)} paid revenue · {analytics.lowStock.length} low-stock items <div className="mt-3 grid gap-2 sm:grid-cols-3">{[["Orders", analytics.orders], ["Revenue", Math.round(analytics.revenue / 100)], ["Low stock", analytics.lowStock.length]].map(([label, value]) => <div key={label}><p className="text-xs">{label}: {value}</p><div className="mt-1 h-3 rounded bg-neutral-100"><div className="h-3 rounded bg-neutral-900" style={{ width: `${Math.min(100, Math.max(4, Number(value)))}%` }} /></div></div>)}</div><button className="mt-3 rounded border px-3 py-1" onClick={() => action("/low-stock-alerts", "POST", {})}>Queue low-stock alerts</button><button className="ml-3 mt-3 rounded border px-3 py-1" onClick={() => download("/reports/operations.csv", "operations-report.csv")}>Download report</button></div>}
      {message && <p className="my-4">{message}</p>}
      <section className="mb-8 rounded border p-5">
        <h2 className="text-xl font-bold">Product management</h2>
        <form onSubmit={saveProduct} className="mt-3 grid gap-2 md:grid-cols-2">
          {["name", "brand", "priceAmount", "stockQuantity"].map((field) => (
            <input key={field} className="rounded border p-2" type={field.includes("Amount") || field.includes("Quantity") ? "number" : "text"} placeholder={field} value={productForm[field]} onChange={(event) => setProductForm((current) => ({ ...current, [field]: event.target.value }))} required />
          ))}
          <textarea className="rounded border p-2 md:col-span-2" placeholder="description" value={productForm.description} onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))} />
          <select className="rounded border p-2" value={productForm.categoryId} onChange={(event) => setProductForm((current) => ({ ...current, categoryId: event.target.value }))}>
            <option value="">No category</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          <textarea className="rounded border p-2" placeholder='Specifications JSON, e.g. {"screen":"6.1 inch"}' value={productForm.specifications} onChange={(event) => setProductForm((current) => ({ ...current, specifications: event.target.value }))} />
          <label className="flex items-center gap-2"><input type="checkbox" checked={productForm.allowBackorder} onChange={(event) => setProductForm((current) => ({ ...current, allowBackorder: event.target.checked }))} /> Allow backorders</label>
          <input type="date" className="rounded border p-2" value={productForm.preorderDate} onChange={(event) => setProductForm((current) => ({ ...current, preorderDate: event.target.value }))} />
          <div className="flex gap-2 md:col-span-2">
            <button className="rounded border px-3 py-2">{editingProductId ? "Save product" : "Create product"}</button>
            {editingProductId && <button type="button" className="rounded border px-3 py-2" onClick={() => { setEditingProductId(null); setProductForm(emptyProduct); }}>Cancel edit</button>}
          </div>
        </form>
        <div className="mt-5 flex gap-2">
          <button className="rounded border px-3 py-2" onClick={() => download("/products-export.csv", "products.csv")}>Export products CSV</button>
          <label className="cursor-pointer rounded border px-3 py-2">Import products CSV<input className="hidden" type="file" accept=".csv,text/csv" onChange={(event) => importProducts(event.target.files?.[0])} /></label>
          <input className="rounded border p-2" placeholder="New category name" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} />
          <button className="rounded border px-3 py-2" onClick={async () => { await action("/categories", "POST", { name: categoryName }); setCategoryName(""); }}>Create category</button>
        </div>
        <form onSubmit={saveVariant} className="mt-5 grid gap-2 md:grid-cols-3">
          <select className="rounded border p-2" value={variantForm.productId} onChange={(event) => setVariantForm((current) => ({ ...current, productId: event.target.value }))} required>
            <option value="">Select product for variant</option>
            {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
          </select>
          {["sku", "name", "priceAmount", "stockQuantity", "options"].map((field) => (
            <input key={field} className="rounded border p-2" type={field.includes("Amount") || field.includes("Quantity") ? "number" : "text"} placeholder={field === "options" ? 'options JSON, e.g. {"color":"Blue"}' : field} value={variantForm[field]} onChange={(event) => setVariantForm((current) => ({ ...current, [field]: event.target.value }))} required />
          ))}
          <button className="rounded border px-3 py-2">Create variant</button>
        </form>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {products.map((product) => (
            <div key={product.id} className="border p-3">
              <p>{product.name} · {product.stockQuantity} stock / {product.reservedQuantity} reserved · {product.active ? "active" : "archived"}</p>
              <p className="text-sm text-neutral-500">{product.category?.name || "Uncategorized"}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button className="rounded border px-3 py-1" onClick={() => editProduct(product)}>Edit</button>
                <button className="rounded border px-3 py-1" onClick={() => action(`/products/${product.id}`, "PATCH", { stockQuantity: product.stockQuantity + 5 })}>+5 stock</button>
                <button className="rounded border px-3 py-1" onClick={() => action(product.active ? `/products/${product.id}` : `/products/${product.id}/restore`, product.active ? "DELETE" : "POST")}>{product.active ? "Archive" : "Restore"}</button>
                <label className="cursor-pointer rounded border px-3 py-1">
                  Upload image
                  <input className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => uploadImage(product.id, event.target.files?.[0])} />
                </label>
              </div>
              <div className="mt-2 flex gap-2">
                {product.images?.map((image) => (
                  <button key={image.id} onClick={() => action(`/products/${product.id}/images/${image.id}`, "DELETE")} title="Delete image">
                    <img src={`${process.env.NEXT_PUBLIC_BACKEND_ORIGIN}${image.url}`} alt={image.altText} className="h-14 w-14 rounded border object-cover" />
                  </button>
                ))}
              </div>
              {product.variants?.map((variant) => (
                <div key={variant.id} className="mt-2 flex items-center justify-between rounded bg-neutral-100 p-2 text-sm">
                  <span>{variant.name} · {variant.sku} · {variant.stockQuantity} stock · £{(variant.priceAmount / 100).toFixed(2)} · {variant.active ? "active" : "archived"}</span>
                  {variant.active && <button className="rounded border px-2 py-1" onClick={() => action(`/products/${product.id}/variants/${variant.id}`, "DELETE")}>Archive</button>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
      <section className="mb-8 rounded border p-5">
        <h2 className="text-xl font-bold">Support tickets</h2>
        {tickets.map((ticket) => <div key={ticket.id} className="mt-3 rounded border p-3"><strong>{ticket.subject} · {ticket.status}</strong><p>{ticket.message}</p><div className="mt-2 flex gap-2"><input className="flex-1 rounded border p-2" placeholder="Reply to customer" value={ticketReplies[ticket.id] || ""} onChange={(event) => setTicketReplies((current) => ({ ...current, [ticket.id]: event.target.value }))} /><button className="rounded border px-3" onClick={() => action(`/tickets/${ticket.id}`, "PATCH", { adminReply: ticketReplies[ticket.id], status: "closed" })}>Reply and close</button></div></div>)}
      </section>
      <section className="mb-8 grid gap-6 rounded border p-5 md:grid-cols-2">
        <div><h2 className="text-xl font-bold">Gift cards</h2><div className="mt-3 flex flex-wrap gap-2"><input className="rounded border p-2" type="number" placeholder="Balance in pence" value={giftCard.balanceAmount} onChange={(event) => setGiftCard((current) => ({ ...current, balanceAmount: event.target.value }))} /><select className="rounded border p-2" value={giftCard.currency} onChange={(event) => setGiftCard((current) => ({ ...current, currency: event.target.value }))}><option>gbp</option><option>usd</option><option>eur</option></select><input className="rounded border p-2" type="date" value={giftCard.expiresAt} onChange={(event) => setGiftCard((current) => ({ ...current, expiresAt: event.target.value }))} /><button className="rounded border px-3" onClick={() => action("/gift-cards", "POST", { ...giftCard, balanceAmount: Number(giftCard.balanceAmount), expiresAt: giftCard.expiresAt || null })}>Issue gift card</button></div>{giftCards.map((card) => <p key={card.id} className="mt-2 text-sm">{card.code} · {card.currency.toUpperCase()} {(card.balanceAmount / 100).toFixed(2)}</p>)}</div>
        <div><h2 className="text-xl font-bold">Product bundles</h2><div className="mt-3 grid gap-2"><input className="rounded border p-2" placeholder="Bundle name" value={bundle.name} onChange={(event) => setBundle((current) => ({ ...current, name: event.target.value }))} /><input className="rounded border p-2" type="number" placeholder="Price in pence" value={bundle.priceAmount} onChange={(event) => setBundle((current) => ({ ...current, priceAmount: event.target.value }))} /><textarea className="rounded border p-2" placeholder='Items JSON, e.g. [{"productId":1,"quantity":2}]' value={bundle.items} onChange={(event) => setBundle((current) => ({ ...current, items: event.target.value }))} /><button className="rounded border p-2" onClick={createBundle}>Create bundle</button></div>{bundles.map((item) => <div key={item.id} className="mt-2 flex justify-between text-sm"><span>{item.name} · £{(item.priceAmount / 100).toFixed(2)} · {item.active ? "active" : "inactive"}</span>{item.active && <button className="underline" onClick={() => action(`/bundles/${item.id}`, "PATCH", { active: false })}>Deactivate</button>}</div>)}</div>
      </section>
      <section className="mb-8 rounded border p-5">
        <h2 className="text-xl font-bold">Returns</h2>
        {returns.map((item) => <div key={item.id} className="mt-3 border p-3"><p>Order #{item.orderId} · {item.reason} · {item.status}</p><div className="mt-2 flex flex-wrap gap-2">{({ requested: ["approved", "rejected"], approved: ["in_transit"], in_transit: ["received"], received: ["refunded"] }[item.status] || []).map((status) => <button key={status} className="rounded border px-3 py-1" onClick={() => action(`/returns/${item.id}`, "PATCH", { status })}>{status}</button>)}</div></div>)}
      </section>
      <section className="mb-8 rounded border p-5">
        <h2 className="text-xl font-bold">Review moderation</h2>
        {reviews.map((review) => <div key={review.id} className="mt-3 border p-3"><p>{review.rating}/5 · {review.title}</p><p>{review.body}</p><div className="mt-2 flex gap-2"><button className="rounded border px-3 py-1" onClick={() => action(`/reviews/${review.id}`, "PATCH", { status: "approved" })}>Approve</button><button className="rounded border px-3 py-1" onClick={() => action(`/reviews/${review.id}`, "PATCH", { status: "rejected" })}>Reject</button></div></div>)}
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
            <select className="rounded border px-3 py-2" value={user.role} onChange={(event) => action(`/users/${user.id}/role`, "PATCH", { role: event.target.value })}>
              {["customer", "support", "catalog", "fulfillment", "operations", "admin"].map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
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
              <button className="rounded border px-3 py-2" onClick={() => action(`/../shipping/orders/${order.id}`, "POST", { carrier: tracking[order.id]?.carrier || "PhoneSine Shipping", service: "standard" })}>Create shipping label</button>
            </div>
            {order.refunds?.map((refund) => <p key={refund.id} className="mt-2 text-sm">Refund {refund.stripeRefundId}: {refund.amount} · {refund.status}</p>)}
          </article>
        ))}
      </div>
    </main>
  );
}
