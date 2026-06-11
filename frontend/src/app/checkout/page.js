"use client";

import Link from "next/link";
import { useContext, useState } from "react";
import { CartContext } from "../contexts/cartContext";
import {
  checkoutTotal,
  deliveryOptions,
  validateCheckoutDetails,
} from "./checkout.mjs";

const initialDetails = {
  email: "",
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  postcode: "",
};

export default function CheckoutPage() {
  const { items, subtotal } = useContext(CartContext);
  const [details, setDetails] = useState(initialDetails);
  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const total = checkoutTotal(subtotal, deliveryMethod);

  const updateDetails = (event) => {
    setDetails((current) => ({
      ...current,
      [event.target.name]: event.target.value,
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
      const response = await fetch(process.env.NEXT_PUBLIC_API_PAYMENT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
          <input className="rounded border p-3 sm:col-span-2" name="email" type="email" placeholder="Email" value={details.email} onChange={updateDetails} />
          <input className="rounded border p-3" name="firstName" placeholder="First name" value={details.firstName} onChange={updateDetails} />
          <input className="rounded border p-3" name="lastName" placeholder="Last name" value={details.lastName} onChange={updateDetails} />
          <input className="rounded border p-3 sm:col-span-2" name="address" placeholder="Address" value={details.address} onChange={updateDetails} />
          <input className="rounded border p-3" name="city" placeholder="City" value={details.city} onChange={updateDetails} />
          <input className="rounded border p-3" name="postcode" placeholder="Postcode" value={details.postcode} onChange={updateDetails} />
        </section>

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
            <div key={item.id} className="flex justify-between py-4 text-sm">
              <span>{item.name} × {item.quantity}</span>
              <span>£{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="space-y-2 border-t pt-4">
          <div className="flex justify-between"><span>Subtotal</span><span>£{subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Delivery</span><span>£{deliveryOptions[deliveryMethod].price.toFixed(2)}</span></div>
          <div className="flex justify-between text-lg font-bold"><span>Total</span><span>£{total.toFixed(2)}</span></div>
        </div>
      </aside>
    </main>
  );
}
