"use client";

import { useState } from "react";
import { authenticatedFetch } from "../components/auth/session.mjs";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    const token = new URLSearchParams(window.location.search).get("token");
    const response = await authenticatedFetch(process.env.NEXT_PUBLIC_API_RESET_PASSWORD_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    setMessage(response.ok ? "Password reset complete. You can now sign in." : await response.text());
  };

  return (
    <main className="mx-auto max-w-xl px-6 py-20">
      <h1 className="text-3xl font-bold">Choose a new password</h1>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <input className="w-full rounded border p-3" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="New password" required />
        <button className="rounded bg-neutral-900 px-5 py-3 text-white">Reset password</button>
      </form>
      {message && <p className="mt-5">{message}</p>}
    </main>
  );
}
