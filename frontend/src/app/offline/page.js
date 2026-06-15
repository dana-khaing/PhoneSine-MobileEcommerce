import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-20 text-center">
      <h1 className="text-3xl font-bold">You are offline</h1>
      <p className="mt-4 text-neutral-600">Reconnect to load live stock, account details, checkout, and order updates.</p>
      <Link href="/" className="mt-6 inline-block rounded border px-4 py-2">Return to storefront</Link>
    </main>
  );
}
