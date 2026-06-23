"use client";

import { Toaster } from "@/components/ui/sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      richColors
      duration={5000}
      theme="dark"
    />
  );
}
