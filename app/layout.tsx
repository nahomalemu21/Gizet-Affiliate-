import type { Metadata } from "next";
import "./globals.css";
import "./functional.css";

export const metadata: Metadata = {
  title: "Gizet Creator Commerce",
  description: "Affiliate tracking, creator earnings, products, orders and payouts for Gizet.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
