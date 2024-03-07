"use client";
import { Inter } from "next/font/google";
import { useState } from "react";
import "./globals.css";
import NavBar from "./components/nav-bar";
import ProductList from "./products/components/productList";

const inter = Inter({ subsets: ["latin"] });

// export const metadata = {
//   title: "Phone Sine",
//   description: "Developed by Phone Sine Members",
// };

export default function RootLayout({ children }) {
  const [search, setSearch] = useState("");
  const handleSearchChange = (catSearch) => {
    setSearch(catSearch.target.value);
  };
  return (
    <html lang="en">
      <body>
        <NavBar Searchlistener={handleSearchChange} />
        {children}
        <ProductList search={search} />
      </body>
    </html>
  );
}
