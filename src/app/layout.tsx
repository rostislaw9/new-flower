import type { ReactNode } from "react";

import { ToastProvider } from "@/components/providers/ToastProvider";
import { defaultLocale } from "@/i18n/config";
import { themeFontClass } from "@/lib/fonts";

import "./globals.css";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang={defaultLocale} data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://res.cloudinary.com" />
      </head>
      <body className={themeFontClass}>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
