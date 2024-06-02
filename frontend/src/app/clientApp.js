"use client";
import NavBar from "./components/nav-bar";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./contexts/authContext";

export default function ClientApp({ children }) {
  return (
    <AuthProvider>
      <NavBar />
      {children}
      <Toaster />
    </AuthProvider>
  );
}
