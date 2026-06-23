import type { ReactNode } from "react";

import { Geist, New_Rocker } from "next/font/google";

import { ToastProvider } from "@/components/providers/ToastProvider";

import "./globals.css";

const fontDisplay = New_Rocker({
  subsets: ["latin"],
  weight: "400",
  style: "normal",
  variable: "--font-display",
  display: "swap",
});

const fontSans = Geist({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      className={`dark ${fontDisplay.variable} ${fontSans.variable}`}
      data-scroll-behavior="smooth"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://res.cloudinary.com" />
      </head>
      <body className="font-sans">
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
