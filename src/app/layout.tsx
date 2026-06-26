import type { ReactNode } from "react";

import { ToastProvider } from "@/components/providers/ToastProvider";

import "./globals.css";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      {children}
      <ToastProvider />
    </>
  );
}
