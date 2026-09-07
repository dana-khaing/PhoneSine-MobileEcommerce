const formatCurrency = (amount, currency = "GBP") =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency }).format((amount || 0) / 100);

export default function OverviewSection({
  action,
  analytics,
  download,
  health,
  launchStatus,
  loadLaunchStatus,
  loadObservability,
  message,
  observability,
}) {
  return (
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
      {observability && <section id="observability" className="my-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">Observability</p>
            <h2 className="mt-1 text-2xl font-bold">Operational telemetry</h2>
            <p className="text-sm text-neutral-600">Live application counters from the protected metrics snapshot endpoint.</p>
          </div>
          <button className="rounded border px-3 py-1" onClick={loadObservability}>Refresh telemetry</button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <article className="rounded-xl border bg-neutral-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Uptime</p><p className="mt-2 text-2xl font-bold">{observability.uptimeSeconds}s</p><p className="mt-1 text-xs text-neutral-500">Current backend process</p></article>
          <article className="rounded-xl border bg-neutral-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Unhandled errors</p><p className="mt-2 text-2xl font-bold">{observability.unhandledErrors || 0}</p><p className="mt-1 text-xs text-neutral-500">Since process start</p></article>
          <article className="rounded-xl border bg-neutral-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Tracked routes</p><p className="mt-2 text-2xl font-bold">{observability.requests?.length || 0}</p><p className="mt-1 text-xs text-neutral-500">Request/status combinations</p></article>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border p-4">
            <h3 className="font-bold">Slowest request paths</h3>
            <div className="mt-2 space-y-2">
              {(observability.requests || []).slice().sort((a, b) => b.averageDurationMs - a.averageDurationMs).slice(0, 5).map((item) => <p key={`${item.method}-${item.path}-${item.status}`} className="text-sm">{item.method} {item.path} · {item.status} · {item.averageDurationMs}ms avg · {item.count} hits</p>)}
              {!observability.requests?.length && <p className="text-sm text-neutral-500">No request metrics recorded yet.</p>}
            </div>
          </div>
          <div className="rounded-xl border p-4">
            <h3 className="font-bold">Operational events</h3>
            <div className="mt-2 space-y-2">
              {(observability.operationalEvents || []).slice(0, 5).map((event) => <p key={`${event.name}-${event.severity}`} className="text-sm">{event.severity} · {event.name} · {event.count} events</p>)}
              {!observability.operationalEvents?.length && <p className="text-sm text-neutral-500">No operational events recorded yet.</p>}
            </div>
          </div>
        </div>
      </section>}
      {message && <p className="my-4">{message}</p>}
    </section>
  );
}
