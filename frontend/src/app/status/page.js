"use client";

import { useEffect, useState } from "react";

const apiOrigin = process.env.NEXT_PUBLIC_BACKEND_ORIGIN;

async function probe(path) {
  if (!apiOrigin) return { ok: false, label: "Not configured", detail: "NEXT_PUBLIC_BACKEND_ORIGIN is missing." };
  try {
    const response = await fetch(`${apiOrigin}${path}`, { cache: "no-store" });
    const body = await response.json().catch(() => ({}));
    return {
      ok: response.ok,
      label: response.ok ? "Healthy" : "Unavailable",
      detail: body.status || body.database || body.ready === true ? "Connected" : "Check backend logs.",
    };
  } catch (error) {
    return { ok: false, label: "Unavailable", detail: error.message };
  }
}

function StatusCard({ title, status, description }) {
  return (
    <article className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold">{title}</h2>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.ok ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {status.label}
        </span>
      </div>
      <p className="mt-3 text-sm text-neutral-600">{description}</p>
      <p className="mt-4 rounded bg-neutral-50 p-3 text-sm">{status.detail}</p>
    </article>
  );
}

export default function StatusPage() {
  const [health, setHealth] = useState({ ok: false, label: "Checking", detail: "Loading health probe..." });
  const [readiness, setReadiness] = useState({ ok: false, label: "Checking", detail: "Loading readiness probe..." });

  useEffect(() => {
    probe("/health").then(setHealth);
    probe("/health/ready").then(setReadiness);
  }, []);

  const allReady = health.ok && readiness.ok;

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-700">Production status</p>
      <h1 className="mt-3 text-4xl font-black tracking-tight">PhoneSine service status</h1>
      <p className="mt-4 max-w-2xl text-neutral-600">
        Use this page after deployment, rollback, or DNS changes to confirm the storefront can reach the API health and readiness endpoints.
      </p>
      <div className={`mt-6 rounded-2xl border p-4 text-sm font-semibold ${allReady ? "border-green-200 bg-green-50 text-green-900" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
        {allReady ? "Storefront and API probes are ready." : "One or more production probes need attention."}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <StatusCard title="API health" status={health} description="Checks database connectivity and base API availability." />
        <StatusCard title="API readiness" status={readiness} description="Checks whether the backend is ready to receive routed traffic." />
      </div>
      <section className="mt-8 rounded-2xl border bg-neutral-950 p-5 text-white">
        <h2 className="text-xl font-bold">Deployment checklist</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-neutral-200">
          <li>Confirm release image tags match the intended production version.</li>
          <li>Run database backup and restore verification before migrations.</li>
          <li>Verify Stripe webhook delivery and admin payment health after traffic is routed.</li>
          <li>Keep the previous release tags ready for fast rollback.</li>
        </ul>
      </section>
    </main>
  );
}
