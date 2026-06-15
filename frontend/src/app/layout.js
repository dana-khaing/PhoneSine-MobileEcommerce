import { Inter } from "next/font/google";
import "./globals.css";
import ClientApp from "./clientApp";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Phone Sine",
  description: "Developed by Phone Sine Members",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Phone Sine",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/icon-192.png",
  },
};

export const viewport = {
  themeColor: "#171717",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientApp>{children}</ClientApp>
      </body>
    </html>
  );
}
