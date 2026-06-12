"use client";
import { useState } from "react";
export default function SecurityPage() {
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const request = async (path, body = {}) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ORIGIN}/auth/two-factor/${path}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` }, body: JSON.stringify(body) });
    const result = response.ok ? await response.json() : null;
    setMessage(response.ok ? "Security settings updated." : await response.text());
    return result;
  };
  return <main className="mx-auto max-w-xl px-6 py-12"><h1 className="text-3xl font-bold">Account security</h1><p className="mt-3">Enable time-based two-factor authentication for sign-in.</p><button className="mt-5 rounded border px-4 py-2" onClick={async () => setSecret((await request("setup"))?.secret || "")}>Generate secret</button>{secret && <p className="mt-4 break-all rounded bg-neutral-100 p-3">Add this secret to your authenticator: {secret}</p>}<div className="mt-4 flex gap-2"><input className="rounded border p-2" placeholder="6-digit code" value={code} onChange={(event) => setCode(event.target.value)} /><button className="rounded border px-4" onClick={() => request("enable", { code })}>Enable 2FA</button></div>{message && <p className="mt-4">{message}</p>}</main>;
}
