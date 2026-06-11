"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function VerifyEmailPage() {
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setMessage("Verification token is missing.");
      return;
    }
    fetch(process.env.NEXT_PUBLIC_API_VERIFY_EMAIL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(await response.text());
        setMessage("Your email is verified. You can now sign in.");
      })
      .catch((error) => setMessage(error.message));
  }, []);

  return (
    <main className="mx-auto max-w-xl px-6 py-20 text-center">
      <h1 className="text-3xl font-bold">Email verification</h1>
      <p className="mt-5">{message}</p>
      <Link href="/products" className="mt-8 inline-block underline">Continue to Phone Sine</Link>
    </main>
  );
}
