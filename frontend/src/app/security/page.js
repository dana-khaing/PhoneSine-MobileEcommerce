"use client";
import { useEffect, useState } from "react";
import { authenticatedFetch } from "../components/auth/session.mjs";
export default function SecurityPage() {
  const [secret, setSecret] = useState("");
  const [provisioningUri, setProvisioningUri] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [sessions, setSessions] = useState([]);
  const loadSessions = () => authenticatedFetch(`${process.env.NEXT_PUBLIC_BACKEND_ORIGIN}/auth/sessions`).then(async (response) => response.ok ? response.json() : []).then(setSessions);
  useEffect(() => { loadSessions(); }, []);
  const request = async (path, body = {}) => {
    const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_BACKEND_ORIGIN}/auth/two-factor/${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result = response.ok ? await response.json() : null;
    setMessage(response.ok ? "Security settings updated." : await response.text());
    return result;
  };
  return <main className="mx-auto max-w-xl px-6 py-12"><h1 className="text-3xl font-bold">Account security</h1><p className="mt-3">Enable time-based two-factor authentication for sign-in.</p><button className="mt-5 rounded border px-4 py-2" onClick={async () => { const setup = await request("setup"); setSecret(setup?.secret || ""); setProvisioningUri(setup?.provisioningUri || ""); setRecoveryCodes(setup?.recoveryCodes || []); }}>Generate authenticator setup</button>{secret && <div className="mt-4 break-all rounded bg-neutral-100 p-3"><p>Secret: {secret}</p><a className="underline" href={provisioningUri}>Open authenticator app</a><p className="mt-2">Recovery codes: {recoveryCodes.join(", ")}</p></div>}<div className="mt-4 flex gap-2"><input className="rounded border p-2" placeholder="6-digit code" value={code} onChange={(event) => setCode(event.target.value)} /><button className="rounded border px-4" onClick={() => request("enable", { code })}>Enable 2FA</button></div>{message && <p className="mt-4">{message}</p>}<section className="mt-10 border-t pt-6"><h2 className="text-xl font-bold">Active sessions</h2>{sessions.map((session) => <div key={session.id} className="mt-3 flex items-center justify-between rounded border p-3"><span className="text-sm">{session.userAgent || "Unknown device"}<br />Expires {new Date(session.expiresAt).toLocaleString()}</span><button className="rounded border px-3 py-2" onClick={async () => { await authenticatedFetch(`${process.env.NEXT_PUBLIC_BACKEND_ORIGIN}/auth/sessions/${session.id}`, { method: "DELETE" }); loadSessions(); }}>Revoke</button></div>)}</section></main>;
}
