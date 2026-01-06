"use client";

import type { Metadata } from "next";
import { Rethink_Sans } from "next/font/google";
import { usePathname } from "next/navigation";
import "./globals.css";
import { FundSelector } from "@/components/fund-selector";
import fundsIndex from "@/data/funds_index.json";

const rethinkSans = Rethink_Sans({
  subsets: ["latin"],
  variable: "--font-rethink-sans",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // Determine current fund ID from pathname
  let currentFundId = "fund-i";
  if (pathname.startsWith("/fund-iii")) {
    currentFundId = "fund-iii";
  } else if (pathname.startsWith("/fund-ii")) {
    currentFundId = "fund-ii";
  }

  return (
    <html lang="en">
      <body
        className={`${rethinkSans.className} antialiased bg-gray-50`}
      >
        <FundSelector funds={fundsIndex.funds} currentFundId={currentFundId} />
        {children}
      </body>
    </html>
  );
}
