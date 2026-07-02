"use client";

import type { ComponentProps } from "react";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { usePathname } from "next/navigation";

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  const pathname = usePathname();
  const isAdmin = pathname.includes("/admin");

  return (
    <NextThemesProvider {...props} forcedTheme={isAdmin ? undefined : "dark"}>
      {children}
    </NextThemesProvider>
  );
}
