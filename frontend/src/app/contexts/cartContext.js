"use client";

import { createContext, useEffect, useState } from "react";
import {
  addCartItem,
  cartItemKey,
  cartItemCount,
  cartSubtotal,
  updateCartItemQuantity,
} from "../cart/cart.mjs";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hasLoadedCart, setHasLoadedCart] = useState(false);

  useEffect(() => {
    const storedCart = localStorage.getItem("phone-sine-cart");
    if (storedCart) {
      try {
        setItems(JSON.parse(storedCart));
      } catch {
        localStorage.removeItem("phone-sine-cart");
      }
    }
    setHasLoadedCart(true);
  }, []);

  useEffect(() => {
    if (hasLoadedCart) {
      localStorage.setItem("phone-sine-cart", JSON.stringify(items));
    }
  }, [hasLoadedCart, items]);

  const addItem = (product) => setItems((current) => addCartItem(current, product));
  const updateQuantity = (productId, quantity) =>
    setItems((current) => updateCartItemQuantity(current, productId, quantity));
  const removeItem = (key) =>
    setItems((current) => current.filter((item) => cartItemKey(item) !== String(key)));
  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount: cartItemCount(items),
        subtotal: cartSubtotal(items),
        isCartOpen,
        setIsCartOpen,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
