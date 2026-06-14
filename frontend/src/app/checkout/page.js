"use client";

import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { CartContext } from "../contexts/cartContext";
import {
  checkoutTotal,
  deliveryOptions,
  validateCheckoutDetails,
} from "./checkout.mjs";
import { cartItemKey } from "../cart/cart.mjs";
import { authenticatedFetch } from "../components/auth/session.mjs";

const initialDetails = {
  email: "",
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  postcode: "",
  country: "GB",
  promotionCode: "",
  giftCardCode: "",
  currency: "gbp",
  savePaymentMethod: false,
};

export default function CheckoutPage() {
  const { items, subtotal } = useContext(CartContext);
  const [details, setDetails] = useState(initialDetails);
  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quote, setQuote] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const total = checkoutTotal(subtotal, deliveryMethod);

  useEffect(() => {
    authenticatedFetch(`${process.env.NEXT_PUBLIC_BACKEND_ORIGIN}/profile`)
      .then((response) => response.ok ? response.json() : null)
      .then((profile) => {
        if (!profile) return;
        setSavedAddresses(profile.addresses || []);
        const preferred = profile.addresses?.find((item) => item.isDefault);
        setDetails((current) => ({ ...current, email: profile.email || current.email, firstName: profile.firstname || current.firstName, lastName: profile.lastname || current.lastName }));
        if (preferred) useSavedAddress(preferred);
      })
      .catch(() => {});
  }, []);

  const useSavedAddress = (item) => {
    const names = String(item.recipientName || "").trim().split(/\s+/);
    setDetails((current) => ({
      ...current,
      firstName: names[0] || current.firstName,
      lastName: names.slice(1).join(" ") || current.lastName,
      address: [item.line1, item.line2].filter(Boolean).join(", "),
      city: item.city,
      postcode: item.postalCode,
      country: item.country,
    }));
  };

  const updateDetails = (event) => {
    setDetails((current) => ({
      ...current,
      [event.target.name]: event.target.type === "checkbox" ? event.target.checked : event.target.value,
    }));
  };

  const saveCheckout = async (event) => {
    event.preventDefault();
    const error = validateCheckoutDetails(details);
    if (error) {
      setMessage(error);
      return;
    }

    const checkout = { ...details, deliveryMethod };
    sessionStorage.setItem(
      "phone-sine-checkout",
      JSON.stringify(checkout)
    );
    setIsSubmitting(true);
    setMessage("");

    try {
      let idempotencyKey = sessionStorage.getItem("phone-sine-payment-key");
      if (!idempotencyKey) {
        idempotencyKey = crypto.randomUUID();
        sessionStorage.setItem("phone-sine-payment-key", idempotencyKey);
      }
      const response = await authenticatedFetch(process.env.NEXT_PUBLIC_API_PAYMENT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({ items, checkout }),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const session = await response.json();
      window.location.assign(session.url);
    } catch (error) {
      setMessage(error.message || "Unable to start payment.");
      setIsSubmitting(false);
    }
  };

  const updateQuote = async () => {
    setMessage("");
    try {
      const response = await authenticatedFetch(process.env.NEXT_PUBLIC_API_PAYMENT_QUOTE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          checkout: { ...details, deliveryMethod },
        }),
      });
      if (!response.ok) throw new Error(await response.text());
      setQuote(await response.json());
    } catch (error) {
      setMessage(error.message);
    }
  };

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-3xl font-bold">Your cart is empty</h1>
        <Link href="/products" className="mt-6 inline-block underline">
          Browse products
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[1fr_380px]">
      <form onSubmit={saveCheckout} className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="mt-2 text-neutral-500">Enter your delivery details.</p>
        </div>

        <section className="grid gap-4 rounded-lg border p-6 sm:grid-cols-2">
          <h2 className="text-xl font-bold sm:col-span-2">Shipping details</h2>
          {savedAddresses.length > 0 && <select className="rounded border p-3 sm:col-span-2" defaultValue="" onChange={(event) => { const selected = savedAddresses.find((item) => String(item.id) === event.target.value); if (selected) useSavedAddress(selected); }}><option value="">Choose a saved address</option>{savedAddresses.map((item) => <option key={item.id} value={item.id}>{item.label}{item.isDefault ? " (default)" : ""} · {item.line1}, {item.city}</option>)}</select>}
          <input className="rounded border p-3 sm:col-span-2" name="email" type="email" placeholder="Email" value={details.email} onChange={updateDetails} />
          <input className="rounded border p-3" name="firstName" placeholder="First name" value={details.firstName} onChange={updateDetails} />
          <input className="rounded border p-3" name="lastName" placeholder="Last name" value={details.lastName} onChange={updateDetails} />
          <input className="rounded border p-3 sm:col-span-2" name="address" placeholder="Address" value={details.address} onChange={updateDetails} />
          <input className="rounded border p-3" name="city" placeholder="City" value={details.city} onChange={updateDetails} />
          <input className="rounded border p-3" name="postcode" placeholder="Postcode" value={details.postcode} onChange={updateDetails} />
          <input className="rounded border p-3" name="country" maxLength="2" placeholder="Country code (GB)" value={details.country} onChange={updateDetails} />
          <input className="rounded border p-3" name="promotionCode" placeholder="Promotion code" value={details.promotionCode} onChange={updateDetails} />
          <input className="rounded border p-3" name="giftCardCode" placeholder="Gift card code" value={details.giftCardCode} onChange={updateDetails} />
          <select className="rounded border p-3" name="currency" value={details.currency} onChange={updateDetails}>
            <option value="gbp">GBP</option>
            <option value="usd">USD</option>
            <option value="eur">EUR</option>
          </select>
          <label className="flex items-center gap-2 sm:col-span-2">
            <input type="checkbox" name="savePaymentMethod" checked={details.savePaymentMethod} onChange={updateDetails} />
            Securely save this payment method with Stripe for future purchases
          </label>
        </section>

        <button className="rounded border px-5 py-3" type="button" onClick={updateQuote}>
          Update tax and promotion
        </button>

        <section className="space-y-3 rounded-lg border p-6">
          <h2 className="text-xl font-bold">Delivery</h2>
          {Object.entries(deliveryOptions).map(([value, option]) => (
            <label key={value} className="flex cursor-pointer justify-between rounded border p-4">
              <span>
                <input className="mr-3" type="radio" name="delivery" value={value} checked={deliveryMethod === value} onChange={() => setDeliveryMethod(value)} />
                {option.label}
              </span>
              <span>{option.price === 0 ? "Free" : `£${option.price.toFixed(2)}`}</span>
            </label>
          ))}
        </section>

        {message && <p role="status" className="rounded bg-neutral-100 p-3">{message}</p>}
        <button disabled={isSubmitting} className="w-full rounded bg-neutral-900 py-3 font-semibold text-white disabled:opacity-60" type="submit">
          {isSubmitting ? "Opening secure payment..." : "Continue to secure payment"}
        </button>
      </form>

      <aside className="h-fit rounded-lg border p-6">
        <h2 className="text-xl font-bold">Order summary</h2>
        <div className="divide-y">
          {items.map((item) => (
            <div key={cartItemKey(item)} className="flex justify-between py-4 text-sm">
              <span>{item.name}{item.variantName ? ` - ${item.variantName}` : ""} × {item.quantity}</span>
              <span>£{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="space-y-2 border-t pt-4">
          <div className="flex justify-between"><span>Subtotal</span><span>£{subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Delivery</span><span>£{deliveryOptions[deliveryMethod].price.toFixed(2)}</span></div>
          {quote && <div className="flex justify-between"><span>Discount</span><span>-£{(quote.discountAmount / 100).toFixed(2)}</span></div>}
          {quote && <div className="flex justify-between"><span>Tax ({quote.taxRate}%)</span><span>£{(quote.taxAmount / 100).toFixed(2)}</span></div>}
          <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{quote ? `${quote.currency.toUpperCase()} ${(quote.totalAmount / 100).toFixed(2)}` : `GBP ${total.toFixed(2)}`}</span></div>
        </div>
      </aside>
    </main>
  );
}
