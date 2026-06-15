"use client";
import NavBar from "./components/nav-bar";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./contexts/authContext";
import { CartProvider } from "./contexts/cartContext";
import CartDrawer from "./cart/cartDrawer";
import { LocaleProvider } from "./contexts/localeContext";
import PwaRegistration from "./components/pwaRegistration";

export default function ClientApp({ children }) {
  return (
    <LocaleProvider>
      <AuthProvider>
        <CartProvider>
        <Toaster />
        <PwaRegistration />
        <NavBar />
        <CartDrawer />
        {children}
        </CartProvider>
      </AuthProvider>
    </LocaleProvider>
  );
}
