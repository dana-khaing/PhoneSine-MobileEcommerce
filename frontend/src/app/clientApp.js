"use client";
import NavBar from "./components/nav-bar";
import { AuthProvider } from "./contexts/authContext";

export default function ClientApp({ children }) {
  return (
    <AuthProvider>
      <NavBar />
      {children}
    </AuthProvider>
  );
}
