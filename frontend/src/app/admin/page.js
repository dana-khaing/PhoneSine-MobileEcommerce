"use client";

import { useEffect, useState } from "react";
import { authenticatedFetch } from "../components/auth/session.mjs";

const formatCurrency = (amount, currency = "GBP") =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency }).format((amount || 0) / 100);

const adminSections = [
  ["overview", "Overview"],
  ["catalog", "Catalog"],
  ["procurement", "Procurement"],
  ["support", "Support"],
  ["promotions", "Promotions"],
  ["people", "People"],
  ["orders", "Orders"],
];

const matchesSearch = (item, query, fields) => {
  if (!query) return true;
  const normalized = query.toLowerCase();
  return fields.some((field) => String(field(item) || "").toLowerCase().includes(normalized));
};

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
  const [launchStatus, setLaunchStatus] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [ticketReplies, setTicketReplies] = useState({});
  const [giftCards, setGiftCards] = useState([]);
  const [giftCard, setGiftCard] = useState({ balanceAmount: "", currency: "gbp", expiresAt: "" });
  const [bundles, setBundles] = useState([]);
  const [bundle, setBundle] = useState({ name: "", description: "", priceAmount: "", items: "[]" });
  const [suppliers, setSuppliers] = useState([]);
  const [supplier, setSupplier] = useState({ name: "", email: "", phone: "" });
  const [warehouses, setWarehouses] = useState([]);
  const [warehouse, setWarehouse] = useState({ name: "", code: "", address: "{}" });
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [purchaseOrder, setPurchaseOrder] = useState({ supplierId: "", warehouseId: "", expectedAt: "", items: "[]" });
  const emptyProduct = { name: "", brand: "", description: "", priceAmount: "", stockQuantity: "", categoryId: "", specifications: "{}", allowBackorder: false, preorderDate: "" };
  const [productForm, setProductForm] = useState(emptyProduct);
  const [editingProductId, setEditingProductId] = useState(null);
  const [adminSearch, setAdminSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
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
  const loadLaunchStatus = () => authenticatedFetch(`${api}/launch-status`, { headers: headers() }).then((response) => response.json()).then(setLaunchStatus);
  const loadTickets = () => authenticatedFetch(`${api}/tickets`, { headers: headers() }).then((response) => response.json()).then(setTickets);
  const loadGiftCards = () => authenticatedFetch(`${api}/gift-cards`, { headers: headers() }).then((response) => response.json()).then(setGiftCards);
  const loadBundles = () => authenticatedFetch(`${api}/bundles`, { headers: headers() }).then((response) => response.json()).then(setBundles);
  const loadSuppliers = () => authenticatedFetch(`${api}/suppliers`, { headers: headers() }).then((response) => response.json()).then(setSuppliers);
  const loadWarehouses = () => authenticatedFetch(`${api}/warehouses`, { headers: headers() }).then((response) => response.json()).then(setWarehouses);
  const loadPurchaseOrders = () => authenticatedFetch(`${api}/purchase-orders`, { headers: headers() }).then((response) => response.json()).then(setPurchaseOrders);

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
    loadLaunchStatus();
    loadTickets();
    loadGiftCards();
    loadBundles();
    loadSuppliers();
    loadWarehouses();
    loadPurchaseOrders();
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
    await loadLaunchStatus();
    await loadTickets();
    await loadGiftCards();
    await loadBundles();
    await loadSuppliers();
    await loadWarehouses();
    await loadPurchaseOrders();
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
  const createWarehouse = async () => {
    try {
      await action("/warehouses", "POST", { ...warehouse, address: JSON.parse(warehouse.address) });
      setWarehouse({ name: "", code: "", address: "{}" });
    } catch {
      setMessage("Warehouse address must be valid JSON.");
    }
  };
  const createPurchaseOrder = async () => {
    try {
      await action("/purchase-orders", "POST", {
        ...purchaseOrder,
        supplierId: Number(purchaseOrder.supplierId),
        warehouseId: Number(purchaseOrder.warehouseId),
        expectedAt: purchaseOrder.expectedAt || null,
        items: JSON.parse(purchaseOrder.items),
      });
      setPurchaseOrder({ supplierId: "", warehouseId: "", expectedAt: "", items: "[]" });
    } catch {
      setMessage("Purchase-order items must be valid JSON.");
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

  const query = adminSearch.trim();
  const visibleProducts = products.filter((product) => matchesSearch(product, query, [
    (item) => item.name,
    (item) => item.brand,
    (item) => item.category?.name,
  ]));
  const visiblePromotions = promotions.filter((item) => matchesSearch(item, query, [(promotion) => promotion.code]));
  const visibleUsers = users.filter((user) => matchesSearch(user, query, [(item) => item.email, (item) => item.role]));
  const visibleReviews = reviews.filter((review) => matchesSearch(review, query, [(item) => item.title, (item) => item.body]));
  const visibleReturns = returns.filter((item) => matchesSearch(item, query, [(request) => request.orderId, (request) => request.reason, (request) => request.status]));
  const visibleTickets = tickets.filter((ticket) => matchesSearch(ticket, query, [(item) => item.subject, (item) => item.message, (item) => item.status]));
  const visibleGiftCards = giftCards.filter((card) => matchesSearch(card, query, [(item) => item.code, (item) => item.currency]));
  const visibleBundles = bundles.filter((item) => matchesSearch(item, query, [(bundle) => bundle.name]));
  const visibleSuppliers = suppliers.filter((item) => matchesSearch(item, query, [(supplier) => supplier.name, (supplier) => supplier.email]));
  const visibleWarehouses = warehouses.filter((item) => matchesSearch(item, query, [(warehouse) => warehouse.name, (warehouse) => warehouse.code]));
  const visiblePurchaseOrders = purchaseOrders.filter((order) => matchesSearch(order, query, [(item) => item.id, (item) => item.supplier?.name, (item) => item.warehouse?.code, (item) => item.status]));
  const visibleOrders = orders
    .filter((order) => orderStatusFilter === "all" || order.status === orderStatusFilter)
    .filter((order) => matchesSearch(order, query, [(item) => item.id, (item) => item.email, (item) => item.status, (item) => item.trackingNumber]));
  const orderStatuses = ["all", ...Array.from(new Set(orders.map((order) => order.status).filter(Boolean)))];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-700">Operations console</p>
          <h1 className="text-3xl font-bold">Commerce admin</h1>
        </div>
        <label className="w-full sm:max-w-sm">
          <span className="sr-only">Search admin records</span>
          <input className="w-full rounded-full border px-4 py-2" placeholder="Search orders, products, users..." value={adminSearch} onChange={(event) => setAdminSearch(event.target.value)} />
        </label>
      </div>
      <nav className="sticky top-0 z-10 -mx-4 mt-6 overflow-x-auto border-y bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-full sm:border">
        <div className="flex min-w-max gap-2">
          {adminSections.map(([id, label]) => <a key={id} className="rounded-full px-3 py-1 text-sm font-semibold hover:bg-neutral-100" href={`#${id}`}>{label}</a>)}
        </div>
      </nav>
      <section id="overview">
      <div className="my-6 grid gap-3 sm:flex sm:flex-wrap">
        <button className="rounded border px-4 py-2" onClick={() => action("/cleanup")}>Clean abandoned orders</button>
        <button className="rounded border px-4 py-2" onClick={() => action("/notifications/deliver")}>Deliver notifications</button>
        <button className="rounded border px-4 py-2" onClick={() => action("/reconcile")}>Reconcile payments</button>
      </div>
      {health && <p className="my-4">Payment health: {health.pending} pending · {health.reviews} reviews · {health.disputes} disputes · {health.failedNotifications} failed notifications</p>}
      {analytics && <section className="my-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">Analytics dashboard</p>
            <h2 className="mt-1 text-2xl font-bold">Realtime commerce performance</h2>
            <p className="text-sm text-neutral-600">Orders, revenue, conversion, product demand, and inventory risk from the live admin analytics endpoint.</p>
          </div>
          <div className="grid w-full gap-2 sm:w-auto sm:grid-flow-col">
            <button className="rounded border px-3 py-1" onClick={() => action("/low-stock-alerts", "POST", {})}>Queue low-stock alerts</button>
            <button className="rounded border px-3 py-1" onClick={() => download("/reports/operations.csv", "operations-report.csv")}>Download report</button>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(analytics.dashboard?.cards || [
            { id: "orders", label: "Total orders", value: analytics.orders, helper: "All order statuses" },
            { id: "revenue", label: "Paid revenue", value: analytics.revenue, format: "currency", helper: "Paid order revenue" },
            { id: "stock", label: "Low-stock items", value: analytics.lowStock.length, helper: "Needs action" },
          ]).map((card) => <article key={card.id} className="rounded-xl border bg-neutral-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{card.label}</p>
            <p className="mt-2 text-2xl font-bold">{card.format === "currency" ? formatCurrency(card.value) : `${card.value}${card.suffix || ""}`}</p>
            <p className="mt-1 text-xs text-neutral-500">{card.helper}</p>
          </article>)}
        </div>
        {analytics.dashboard && <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border p-4">
            <h3 className="font-bold">Revenue trend</h3>
            <p className="mt-2 text-sm text-neutral-600">Last 30 days: {formatCurrency(analytics.dashboard.revenueTrend.current30Days)}</p>
            <p className="text-sm text-neutral-600">Previous 30 days: {formatCurrency(analytics.dashboard.revenueTrend.previous30Days)}</p>
            <div className="mt-3 h-3 rounded bg-neutral-100"><div className="h-3 rounded bg-amber-500" style={{ width: `${Math.min(100, Math.max(5, Math.abs(analytics.dashboard.revenueTrend.percentChange)))}%` }} /></div>
            <p className="mt-2 text-sm font-semibold">{analytics.dashboard.revenueTrend.percentChange}% revenue change</p>
          </div>
          <div className="rounded-xl border p-4">
            <h3 className="font-bold">Checkout funnel</h3>
            <p className="mt-2 text-sm text-neutral-600">{analytics.dashboard.funnel.productViews} product views</p>
            <p className="text-sm text-neutral-600">{analytics.dashboard.funnel.orders} orders · {analytics.dashboard.funnel.paidOrders} paid</p>
            <p className="mt-2 text-2xl font-bold">{analytics.dashboard.funnel.conversionRate}%</p>
          </div>
          <div className="rounded-xl border p-4">
            <h3 className="font-bold">Top products</h3>
            <div className="mt-2 space-y-2">
              {analytics.dashboard.topProducts.length ? analytics.dashboard.topProducts.map((item) => <p key={`${item.productId}-${item.name}`} className="text-sm">{item.name}: {item.units} units</p>) : <p className="text-sm text-neutral-500">No paid product demand yet.</p>}
            </div>
          </div>
        </div>}
      </section>}
      {launchStatus && <section className="my-4 rounded border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Launch status</h2>
            <p className="text-sm text-neutral-600">{launchStatus.ready ? "Ready for production launch" : `${launchStatus.blockers.length} launch blockers remain`} · {launchStatus.checklist.completed}/{launchStatus.checklist.total} checklist items complete</p>
          </div>
          <button className="rounded border px-3 py-1" onClick={loadLaunchStatus}>Refresh launch status</button>
        </div>
        {launchStatus.blockers.length > 0 && <div className="mt-3 rounded bg-red-50 p-3 text-sm"><strong>Blockers:</strong><ul className="mt-2 list-disc pl-5">{launchStatus.blockers.slice(0, 6).map((blocker) => <li key={blocker}>{blocker}</li>)}</ul></div>}
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {launchStatus.providers.map((provider) => <p key={provider.id} className="rounded bg-neutral-100 p-2 text-sm">{provider.ready ? "Ready" : "Missing"} · {provider.label}: {provider.configured}/{provider.total}</p>)}
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {launchStatus.checklist.items.map((item) => <p key={item.id} className="text-sm">{item.done ? "Done" : "Open"} · {item.label}</p>)}
        </div>
      </section>}
      {message && <p className="my-4">{message}</p>}
      </section>
      <section id="catalog" className="mb-8 rounded border p-5">
        <h2 className="text-xl font-bold">Product management</h2>
        <p className="mt-1 text-sm text-neutral-500">{visibleProducts.length} of {products.length} products shown</p>
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
        <div className="mt-5 flex flex-wrap gap-2">
          <button className="rounded border px-3 py-2" onClick={() => download("/products-export.csv", "products.csv")}>Export products CSV</button>
          <label className="cursor-pointer rounded border px-3 py-2">Import products CSV<input className="hidden" type="file" accept=".csv,text/csv" onChange={(event) => importProducts(event.target.files?.[0])} /></label>
          <input className="min-w-0 flex-1 rounded border p-2" placeholder="New category name" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} />
          <button className="rounded border px-3 py-2" onClick={async () => { await action("/categories", "POST", { name: categoryName }); setCategoryName(""); }}>Create category</button>
        </div>
        <form onSubmit={saveVariant} className="mt-5 grid gap-2 md:grid-cols-3">
          <select className="rounded border p-2" value={variantForm.productId} onChange={(event) => setVariantForm((current) => ({ ...current, productId: event.target.value }))} required>
            <option value="">Select product for variant</option>
            {visibleProducts.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
          </select>
          {["sku", "name", "priceAmount", "stockQuantity", "options"].map((field) => (
            <input key={field} className="rounded border p-2" type={field.includes("Amount") || field.includes("Quantity") ? "number" : "text"} placeholder={field === "options" ? 'options JSON, e.g. {"color":"Blue"}' : field} value={variantForm[field]} onChange={(event) => setVariantForm((current) => ({ ...current, [field]: event.target.value }))} required />
          ))}
          <button className="rounded border px-3 py-2">Create variant</button>
        </form>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {visibleProducts.map((product) => (
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
      <section id="procurement" className="mb-8 rounded border p-5">
        <h2 className="text-xl font-bold">Inventory procurement</h2>
        <div className="mt-4 grid gap-6 lg:grid-cols-3">
          <div>
            <h3 className="font-bold">Suppliers</h3>
            <div className="mt-2 grid gap-2">{["name", "email", "phone"].map((field) => <input key={field} className="rounded border p-2" placeholder={field} value={supplier[field]} onChange={(event) => setSupplier((current) => ({ ...current, [field]: event.target.value }))} />)}<button className="rounded border p-2" onClick={async () => { await action("/suppliers", "POST", supplier); setSupplier({ name: "", email: "", phone: "" }); }}>Create supplier</button></div>
            {visibleSuppliers.map((item) => <p key={item.id} className="mt-2 text-sm">{item.name} · {item.email || "No email"}</p>)}
          </div>
          <div>
            <h3 className="font-bold">Warehouses</h3>
            <div className="mt-2 grid gap-2"><input className="rounded border p-2" placeholder="Name" value={warehouse.name} onChange={(event) => setWarehouse((current) => ({ ...current, name: event.target.value }))} /><input className="rounded border p-2" placeholder="Code" value={warehouse.code} onChange={(event) => setWarehouse((current) => ({ ...current, code: event.target.value }))} /><textarea className="rounded border p-2" placeholder='Address JSON, e.g. {"city":"London"}' value={warehouse.address} onChange={(event) => setWarehouse((current) => ({ ...current, address: event.target.value }))} /><button className="rounded border p-2" onClick={createWarehouse}>Create warehouse</button></div>
            {visibleWarehouses.map((item) => <div key={item.id} className="mt-2 text-sm"><strong>{item.code} · {item.name}</strong>{item.stocks?.map((stock) => <p key={stock.id}>{stock.product?.name}: {stock.quantity}</p>)}</div>)}
          </div>
          <div>
            <h3 className="font-bold">New purchase order</h3>
            <div className="mt-2 grid gap-2"><select className="rounded border p-2" value={purchaseOrder.supplierId} onChange={(event) => setPurchaseOrder((current) => ({ ...current, supplierId: event.target.value }))}><option value="">Supplier</option>{visibleSuppliers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><select className="rounded border p-2" value={purchaseOrder.warehouseId} onChange={(event) => setPurchaseOrder((current) => ({ ...current, warehouseId: event.target.value }))}><option value="">Warehouse</option>{visibleWarehouses.map((item) => <option key={item.id} value={item.id}>{item.code}</option>)}</select><input className="rounded border p-2" type="date" value={purchaseOrder.expectedAt} onChange={(event) => setPurchaseOrder((current) => ({ ...current, expectedAt: event.target.value }))} /><textarea className="rounded border p-2" placeholder='Items JSON, e.g. [{"productId":1,"quantity":10,"unitCostAmount":50000}]' value={purchaseOrder.items} onChange={(event) => setPurchaseOrder((current) => ({ ...current, items: event.target.value }))} /><button className="rounded border p-2" onClick={createPurchaseOrder}>Create purchase order</button></div>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">{visiblePurchaseOrders.map((order) => <article key={order.id} className="rounded border p-3"><strong>PO #{order.id} · {order.supplier?.name} · {order.status}</strong><p className="text-sm">{order.warehouse?.code} · £{(order.totalAmount / 100).toFixed(2)}</p>{order.items?.map((item) => <p key={item.id} className="text-sm">{item.product?.name}: {item.quantity} ordered / {item.receivedQuantity} received</p>)}{order.status !== "received" && <button className="mt-2 rounded border px-3 py-1" onClick={() => action(`/purchase-orders/${order.id}/receive`)}>Receive order</button>}</article>)}</div>
      </section>
      <section id="support" className="mb-8 rounded border p-5">
        <h2 className="text-xl font-bold">Support tickets</h2>
        {visibleTickets.map((ticket) => <div key={ticket.id} className="mt-3 rounded border p-3"><strong>{ticket.subject} · {ticket.status}</strong><p>{ticket.message}</p><div className="mt-2 flex gap-2"><input className="flex-1 rounded border p-2" placeholder="Reply to customer" value={ticketReplies[ticket.id] || ""} onChange={(event) => setTicketReplies((current) => ({ ...current, [ticket.id]: event.target.value }))} /><button className="rounded border px-3" onClick={() => action(`/tickets/${ticket.id}`, "PATCH", { adminReply: ticketReplies[ticket.id], status: "closed" })}>Reply and close</button></div></div>)}
      </section>
      <section className="mb-8 grid gap-6 rounded border p-5 md:grid-cols-2">
        <div><h2 className="text-xl font-bold">Gift cards</h2><div className="mt-3 flex flex-wrap gap-2"><input className="rounded border p-2" type="number" placeholder="Balance in pence" value={giftCard.balanceAmount} onChange={(event) => setGiftCard((current) => ({ ...current, balanceAmount: event.target.value }))} /><select className="rounded border p-2" value={giftCard.currency} onChange={(event) => setGiftCard((current) => ({ ...current, currency: event.target.value }))}><option>gbp</option><option>usd</option><option>eur</option></select><input className="rounded border p-2" type="date" value={giftCard.expiresAt} onChange={(event) => setGiftCard((current) => ({ ...current, expiresAt: event.target.value }))} /><button className="rounded border px-3" onClick={() => action("/gift-cards", "POST", { ...giftCard, balanceAmount: Number(giftCard.balanceAmount), expiresAt: giftCard.expiresAt || null })}>Issue gift card</button></div>{visibleGiftCards.map((card) => <p key={card.id} className="mt-2 text-sm">{card.code} · {card.currency.toUpperCase()} {(card.balanceAmount / 100).toFixed(2)}</p>)}</div>
        <div><h2 className="text-xl font-bold">Product bundles</h2><div className="mt-3 grid gap-2"><input className="rounded border p-2" placeholder="Bundle name" value={bundle.name} onChange={(event) => setBundle((current) => ({ ...current, name: event.target.value }))} /><input className="rounded border p-2" type="number" placeholder="Price in pence" value={bundle.priceAmount} onChange={(event) => setBundle((current) => ({ ...current, priceAmount: event.target.value }))} /><textarea className="rounded border p-2" placeholder='Items JSON, e.g. [{"productId":1,"quantity":2}]' value={bundle.items} onChange={(event) => setBundle((current) => ({ ...current, items: event.target.value }))} /><button className="rounded border p-2" onClick={createBundle}>Create bundle</button></div>{visibleBundles.map((item) => <div key={item.id} className="mt-2 flex justify-between text-sm"><span>{item.name} · £{(item.priceAmount / 100).toFixed(2)} · {item.active ? "active" : "inactive"}</span>{item.active && <button className="underline" onClick={() => action(`/bundles/${item.id}`, "PATCH", { active: false })}>Deactivate</button>}</div>)}</div>
      </section>
      <section className="mb-8 rounded border p-5">
        <h2 className="text-xl font-bold">Returns</h2>
        {visibleReturns.map((item) => <div key={item.id} className="mt-3 border p-3"><p>Order #{item.orderId} · {item.reason} · {item.status}</p><div className="mt-2 flex flex-wrap gap-2">{({ requested: ["approved", "rejected"], approved: ["in_transit"], in_transit: ["received"], received: ["refunded"] }[item.status] || []).map((status) => <button key={status} className="rounded border px-3 py-1" onClick={() => action(`/returns/${item.id}`, "PATCH", { status })}>{status}</button>)}</div></div>)}
      </section>
      <section className="mb-8 rounded border p-5">
        <h2 className="text-xl font-bold">Review moderation</h2>
        {visibleReviews.map((review) => <div key={review.id} className="mt-3 border p-3"><p>{review.rating}/5 · {review.title}</p><p>{review.body}</p><div className="mt-2 flex gap-2"><button className="rounded border px-3 py-1" onClick={() => action(`/reviews/${review.id}`, "PATCH", { status: "approved" })}>Approve</button><button className="rounded border px-3 py-1" onClick={() => action(`/reviews/${review.id}`, "PATCH", { status: "rejected" })}>Reject</button></div></div>)}
      </section>
      <section id="promotions" className="mb-8 rounded border p-5">
        <h2 className="text-xl font-bold">Promotions</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {["code", "percentOff", "maxUses", "perCustomerLimit"].map((field) => (
            <input key={field} className="rounded border p-2" type={field === "code" ? "text" : "number"} placeholder={field} value={promotion[field]} onChange={(event) => setPromotion((current) => ({ ...current, [field]: event.target.value }))} />
          ))}
          <button className="rounded border px-3 py-2" onClick={() => action("/promotions", "POST", promotion)}>Create promotion</button>
        </div>
        {visiblePromotions.map((item) => <p key={item.id} className="mt-2 text-sm">{item.code}: {item.percentOff}% · {item.useCount}/{item.maxUses || "unlimited"} uses</p>)}
      </section>
      <section id="people" className="mb-8 rounded border p-5">
        <h2 className="text-xl font-bold">User roles</h2>
        {visibleUsers.map((user) => (
          <div key={user.id} className="mt-3 flex items-center justify-between border p-3">
            <span>{user.email} · {user.role} · {user.emailVerifiedAt ? "verified" : "unverified"}</span>
            <select className="rounded border px-3 py-2" value={user.role} onChange={(event) => action(`/users/${user.id}/role`, "PATCH", { role: event.target.value })}>
              {["customer", "support", "catalog", "fulfillment", "operations", "admin"].map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
          </div>
        ))}
      </section>
      <section id="orders" className="space-y-5">
        <div className="rounded border p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">Orders</h2>
              <p className="text-sm text-neutral-500">{visibleOrders.length} of {orders.length} orders shown</p>
            </div>
            <select className="rounded border px-3 py-2" aria-label="Filter orders by status" value={orderStatusFilter} onChange={(event) => setOrderStatusFilter(event.target.value)}>
              {orderStatuses.map((status) => <option key={status} value={status}>{status === "all" ? "All statuses" : status}</option>)}
            </select>
          </div>
        </div>
        {visibleOrders.map((order) => (
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
      </section>
    </main>
  );
}
