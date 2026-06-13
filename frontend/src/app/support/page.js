"use client";
import Link from "next/link"; import { useEffect, useState } from "react";
import { authenticatedFetch } from "../components/auth/session.mjs";
export default function SupportPage() {
  const [tickets, setTickets] = useState([]), [subject, setSubject] = useState(""), [message, setMessage] = useState(""), [giftCode, setGiftCode] = useState(""), [gift, setGift] = useState(null);
  const headers = () => ({ "Content-Type": "application/json" });
  const load = () => authenticatedFetch(`${process.env.NEXT_PUBLIC_BACKEND_ORIGIN}/customer/tickets`, { headers: headers() }).then((response) => response.json()).then(setTickets);
  useEffect(load, []);
  const submit = async () => { await authenticatedFetch(`${process.env.NEXT_PUBLIC_BACKEND_ORIGIN}/customer/tickets`, { method: "POST", headers: headers(), body: JSON.stringify({ subject, message }) }); setSubject(""); setMessage(""); load(); };
  const checkGift = () => authenticatedFetch(`${process.env.NEXT_PUBLIC_BACKEND_ORIGIN}/customer/gift-cards/${giftCode}`).then((response) => response.json()).then(setGift);
  const recent = typeof window === "undefined" ? [] : JSON.parse(localStorage.getItem("phone-sine-recent") || "[]");
  return <main className="mx-auto max-w-4xl px-6 py-12"><h1 className="text-3xl font-bold">Customer support</h1><section className="mt-8 grid gap-2"><input className="rounded border p-2" placeholder="Subject" value={subject} onChange={(event) => setSubject(event.target.value)} /><textarea className="rounded border p-2" placeholder="How can we help?" value={message} onChange={(event) => setMessage(event.target.value)} /><button className="rounded border p-2" onClick={submit}>Open support ticket</button>{tickets.map((ticket) => <p key={ticket.id} className="rounded bg-neutral-100 p-3">{ticket.subject} · {ticket.status}{ticket.adminReply ? ` · ${ticket.adminReply}` : ""}</p>)}</section><section className="mt-8"><h2 className="text-xl font-bold">Gift card balance</h2><input className="mt-2 rounded border p-2" value={giftCode} onChange={(event) => setGiftCode(event.target.value)} /><button className="ml-2 rounded border p-2" onClick={checkGift}>Check</button>{gift && <p>{gift.currency.toUpperCase()} {(gift.balanceAmount / 100).toFixed(2)}</p>}</section><section className="mt-8"><h2 className="text-xl font-bold">Recently viewed</h2>{recent.map((item) => <Link key={item.id} href={`/products/${item.id}`} className="mt-2 block underline">{item.name}</Link>)}</section></main>;
}
