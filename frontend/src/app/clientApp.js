"use client";
import NavBar from "./components/nav-bar";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./contexts/authContext";
import { CartProvider } from "./contexts/cartContext";
import CartDrawer from "./cart/cartDrawer";

export default function ClientApp({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        <Toaster />
        <NavBar />
        <CartDrawer />
        {children}
      </CartProvider>
    </AuthProvider>
  );
}
