"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    const response = await fetch(process.env.NEXT_PUBLIC_API_FORGOT_PASSWORD_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setMessage(response.ok ? "If that account exists, a reset link has been sent." : await response.text());
  };

  return (
    <main className="mx-auto max-w-xl px-6 py-20">
      <h1 className="text-3xl font-bold">Reset your password</h1>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <input className="w-full rounded border p-3" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" required />
        <button className="rounded bg-neutral-900 px-5 py-3 text-white">Send reset link</button>
      </form>
      {message && <p className="mt-5">{message}</p>}
    </main>
  );
}
