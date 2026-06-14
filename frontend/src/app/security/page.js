"use client";

import { useEffect, useState } from "react";
import { authenticatedFetch } from "../components/auth/session.mjs";

const api = () => process.env.NEXT_PUBLIC_BACKEND_ORIGIN;

export default function SecurityPage() {
  const [secret, setSecret] = useState("");
  const [provisioningUri, setProvisioningUri] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [sessions, setSessions] = useState([]);
  const [loginEvents, setLoginEvents] = useState([]);

  const loadSecurityActivity = async () => {
    const [sessionsResponse, eventsResponse] = await Promise.all([
      authenticatedFetch(`${api()}/auth/sessions`),
      authenticatedFetch(`${api()}/auth/login-events`),
    ]);
    setSessions(sessionsResponse.ok ? await sessionsResponse.json() : []);
    setLoginEvents(eventsResponse.ok ? await eventsResponse.json() : []);
  };

  useEffect(() => {
    loadSecurityActivity();
  }, []);

  const request = async (path, body = {}) => {
    const response = await authenticatedFetch(`${api()}/auth/two-factor/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = response.ok ? await response.json() : null;
    setMessage(response.ok ? "Security settings updated." : await response.text());
    return result;
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold">Account security</h1>
      <p className="mt-3">Manage two-factor authentication, linked sign-in providers, active sessions, and recent login activity.</p>

      <section className="mt-8 rounded border p-5">
        <h2 className="text-xl font-bold">Two-factor authentication</h2>
        <button className="mt-5 rounded border px-4 py-2" onClick={async () => {
          const setup = await request("setup");
          setSecret(setup?.secret || "");
          setProvisioningUri(setup?.provisioningUri || "");
          setRecoveryCodes(setup?.recoveryCodes || []);
        }}>Generate authenticator setup</button>
        {secret && <div className="mt-4 break-all rounded bg-neutral-100 p-3"><p>Secret: {secret}</p><a className="underline" href={provisioningUri}>Open authenticator app</a><p className="mt-2">Recovery codes: {recoveryCodes.join(", ")}</p></div>}
        <div className="mt-4 flex gap-2"><input className="rounded border p-2" placeholder="6-digit code" value={code} onChange={(event) => setCode(event.target.value)} /><button className="rounded border px-4" onClick={() => request("enable", { code })}>Enable 2FA</button></div>
        {message && <p className="mt-4">{message}</p>}
      </section>

      <section className="mt-8 rounded border p-5">
        <h2 className="text-xl font-bold">Linked sign-in providers</h2>
        <p className="mt-2 text-sm text-neutral-600">Link a provider while signed in so either method opens this account.</p>
        <div className="mt-4 flex gap-3">
          <a className="rounded border px-4 py-2" href={`${api()}/auth/oauth/google/start`}>Link Google</a>
          <a className="rounded border px-4 py-2" href={`${api()}/auth/oauth/apple/start`}>Link Apple</a>
        </div>
      </section>

      <section className="mt-8 rounded border p-5">
        <h2 className="text-xl font-bold">Active sessions</h2>
        {sessions.map((session) => <div key={session.id} className="mt-3 flex items-center justify-between rounded border p-3"><span className="text-sm">{session.userAgent || "Unknown device"}<br />Expires {new Date(session.expiresAt).toLocaleString()}</span><button className="rounded border px-3 py-2" onClick={async () => { await authenticatedFetch(`${api()}/auth/sessions/${session.id}`, { method: "DELETE" }); loadSecurityActivity(); }}>Revoke</button></div>)}
      </section>

      <section className="mt-8 rounded border p-5">
        <h2 className="text-xl font-bold">Recent login activity</h2>
        {loginEvents.map((event) => <div key={event.id} className="mt-3 rounded border p-3 text-sm"><strong>{event.successful ? "Successful" : "Failed"} {event.method} login</strong><br />{event.ipAddress || "Unknown address"} · {new Date(event.createdAt).toLocaleString()}<br /><span className="text-neutral-600">{event.userAgent || "Unknown device"}{event.reason ? ` · ${event.reason}` : ""}</span></div>)}
      </section>
    </main>
  );
}
