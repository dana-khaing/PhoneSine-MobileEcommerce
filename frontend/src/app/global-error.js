"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    const backend = process.env.NEXT_PUBLIC_BACKEND_ORIGIN;
    if (!backend) return;
    fetch(`${backend}/client-errors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error?.message,
        digest: error?.digest,
        path: window.location.pathname,
      }),
    }).catch(() => {});
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-neutral-50 p-6">
        <main className="max-w-lg rounded-lg border bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="mt-3 text-neutral-600">The error has been reported. You can safely try again.</p>
          <button className="mt-6 rounded bg-neutral-900 px-4 py-2 text-white" onClick={() => reset()}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
