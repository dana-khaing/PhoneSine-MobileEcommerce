import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20 text-center">
      <h1 className="text-3xl font-bold">Payment cancelled</h1>
      <p className="mt-4 text-neutral-600">Your cart is still available. No payment was taken.</p>
      <Link href="/checkout" className="mt-8 inline-block rounded bg-neutral-900 px-6 py-3 text-white">
        Return to checkout
      </Link>
    </main>
  );
}
