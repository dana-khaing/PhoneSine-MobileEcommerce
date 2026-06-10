"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useContext } from "react";
import { CartContext } from "../contexts/cartContext";

export default function CartDrawer() {
  const {
    items,
    subtotal,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
  } = useContext(CartContext);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setIsCartOpen(false)}>
      <aside
        className="ml-auto flex h-full w-full max-w-md flex-col bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-bold">Shopping Cart</h2>
          <button aria-label="Close cart" onClick={() => setIsCartOpen(false)}>
            <X />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {items.length === 0 ? (
            <p className="text-center text-neutral-500">Your cart is empty.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 border-b py-4">
                <img src="/iph15-pro.jpeg" alt={item.name} className="h-20 w-20 object-contain" />
                <div className="flex-1">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-neutral-500">£{item.price.toFixed(2)}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <button aria-label={`Decrease ${item.name}`} onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <Minus className="h-4 w-4" />
                    </button>
                    <span>{item.quantity}</span>
                    <button aria-label={`Increase ${item.name}`} onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Plus className="h-4 w-4" />
                    </button>
                    <button className="ml-auto" aria-label={`Remove ${item.name}`} onClick={() => removeItem(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t pt-4">
          <div className="mb-4 flex justify-between text-lg font-bold">
            <span>Subtotal</span>
            <span>£{subtotal.toFixed(2)}</span>
          </div>
          <Link
            href="/checkout"
            onClick={() => setIsCartOpen(false)}
            className={`block w-full rounded bg-neutral-900 py-3 text-center text-white ${
              items.length === 0 ? "pointer-events-none opacity-50" : ""
            }`}
          >
            Checkout
          </Link>
        </div>
      </aside>
    </div>
  );
}
