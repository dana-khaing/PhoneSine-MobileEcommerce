"use client";

import { useEffect, useState } from "react";
import { authenticatedFetch } from "../components/auth/session.mjs";

const emptyAddress = { label: "", recipientName: "", line1: "", line2: "", city: "", region: "", postalCode: "", country: "GB", phone: "", isDefault: false };
const api = () => `${process.env.NEXT_PUBLIC_BACKEND_ORIGIN}/profile`;

export default function ProfilePage() {
  const [profile, setProfile] = useState({ firstname: "", lastname: "", email: "", addresses: [] });
  const [address, setAddress] = useState(emptyAddress);
  const [editingId, setEditingId] = useState(null);
  const [deletionConfirmation, setDeletionConfirmation] = useState("");
  const [message, setMessage] = useState("Loading profile...");

  const load = () => authenticatedFetch(api()).then(async (response) => {
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  }).then((result) => { setProfile(result); setMessage(""); }).catch((error) => setMessage(error.message));

  useEffect(() => { load(); }, []);

  const saveProfile = async (event) => {
    event.preventDefault();
    const response = await authenticatedFetch(api(), { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ firstname: profile.firstname, lastname: profile.lastname }) });
    setMessage(response.ok ? "Profile updated." : await response.text());
  };
  const saveAddress = async (event) => {
    event.preventDefault();
    const response = await authenticatedFetch(`${api()}/addresses${editingId ? `/${editingId}` : ""}`, { method: editingId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(address) });
    setMessage(response.ok ? "Address saved." : await response.text());
    if (response.ok) { setAddress(emptyAddress); setEditingId(null); load(); }
  };
  const editAddress = (item) => { setEditingId(item.id); setAddress({ ...emptyAddress, ...item }); };
  const removeAddress = async (id) => { await authenticatedFetch(`${api()}/addresses/${id}`, { method: "DELETE" }); load(); };
  const exportData = async () => {
    const response = await authenticatedFetch(`${api()}/export`);
    if (!response.ok) return setMessage(await response.text());
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = url;
    link.download = "phone-sine-account-data.json";
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Account data exported.");
  };
  const deleteAccount = async () => {
    const response = await authenticatedFetch(api(), {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmation: deletionConfirmation }),
    });
    if (!response.ok) return setMessage(await response.text());
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    window.location.assign("/");
  };

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold">Your profile</h1>
      {message && <p className="mt-4">{message}</p>}
      <form onSubmit={saveProfile} className="mt-8 grid gap-3 rounded border p-5 sm:grid-cols-2">
        <h2 className="text-xl font-bold sm:col-span-2">Personal details</h2>
        <input className="rounded border p-2" placeholder="First name" value={profile.firstname || ""} onChange={(event) => setProfile((current) => ({ ...current, firstname: event.target.value }))} required />
        <input className="rounded border p-2" placeholder="Last name" value={profile.lastname || ""} onChange={(event) => setProfile((current) => ({ ...current, lastname: event.target.value }))} required />
        <input className="rounded border bg-neutral-100 p-2 sm:col-span-2" value={profile.email || ""} disabled />
        <button className="rounded bg-neutral-900 px-4 py-2 text-white sm:col-span-2">Save profile</button>
      </form>

      <section className="mt-8 rounded border p-5"><h2 className="text-xl font-bold">Address book</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{profile.addresses?.map((item) => <article key={item.id} className="rounded border p-4"><strong>{item.label}{item.isDefault ? " · Default" : ""}</strong><p className="mt-2 text-sm">{item.recipientName}<br />{item.line1}{item.line2 ? <><br />{item.line2}</> : null}<br />{item.city}{item.region ? `, ${item.region}` : ""} {item.postalCode}<br />{item.country}</p><div className="mt-3 flex gap-2"><button className="rounded border px-3 py-1" onClick={() => editAddress(item)}>Edit</button><button className="rounded border px-3 py-1" onClick={() => removeAddress(item.id)}>Delete</button></div></article>)}</div></section>

      <form onSubmit={saveAddress} className="mt-8 grid gap-3 rounded border p-5 sm:grid-cols-2">
        <h2 className="text-xl font-bold sm:col-span-2">{editingId ? "Edit address" : "Add address"}</h2>
        {["label", "recipientName", "line1", "line2", "city", "region", "postalCode", "country", "phone"].map((field) => <input key={field} className="rounded border p-2" placeholder={field} value={address[field] || ""} onChange={(event) => setAddress((current) => ({ ...current, [field]: event.target.value }))} required={["label", "recipientName", "line1", "city", "postalCode", "country"].includes(field)} />)}
        <label className="flex items-center gap-2"><input type="checkbox" checked={address.isDefault} onChange={(event) => setAddress((current) => ({ ...current, isDefault: event.target.checked }))} /> Use as default address</label>
        <div className="flex gap-2 sm:col-span-2"><button className="rounded bg-neutral-900 px-4 py-2 text-white">Save address</button>{editingId && <button type="button" className="rounded border px-4 py-2" onClick={() => { setEditingId(null); setAddress(emptyAddress); }}>Cancel</button>}</div>
      </form>

      <section className="mt-8 rounded border p-5">
        <h2 className="text-xl font-bold">Privacy controls</h2>
        <p className="mt-2 text-sm">Download a portable copy of your profile, orders, support activity, and account history.</p>
        <button className="mt-4 rounded border px-4 py-2" type="button" onClick={exportData}>Download my data</button>
        <div className="mt-6 border-t pt-5">
          <h3 className="font-bold text-red-700">Delete account</h3>
          <p className="mt-2 text-sm">This permanently removes your account data. Completed commerce records are retained only in anonymized form.</p>
          <label className="mt-3 block text-sm" htmlFor="delete-confirmation">Enter DELETE to confirm</label>
          <input id="delete-confirmation" className="mt-2 rounded border p-2" value={deletionConfirmation} onChange={(event) => setDeletionConfirmation(event.target.value)} />
          <button className="ml-2 rounded bg-red-700 px-4 py-2 text-white disabled:opacity-50" type="button" disabled={deletionConfirmation !== "DELETE"} onClick={deleteAccount}>Delete my account</button>
        </div>
      </section>
    </main>
  );
}
