"use client";

import { useCallback, useMemo } from "react";

import { useLocale } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { type Locale, defaultLocale, locales } from "@/i18n/config";
import {
  getLocalizedPath,
  isSupportedLocale,
  persistPreferredLocale,
} from "@/lib/locale-utils";
import { cn } from "@/lib/utils";

import { Button } from "./Button";

interface LanguageSwitcherProps {
  className?: string;
  linkClassName?: string;
}

export function LanguageSwitcher({
  className,
  linkClassName,
}: LanguageSwitcherProps) {
  const rawLocale = useLocale();
  const locale: Locale = isSupportedLocale(rawLocale)
    ? rawLocale
    : defaultLocale;

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchString = useMemo(
    () => searchParams?.toString() ?? "",
    [searchParams],
  );

  const handleSwitch = useCallback(
    (nextLocale: Locale) => {
      if (!pathname || nextLocale === locale) {
        return;
      }
      persistPreferredLocale(nextLocale);
      const nextPath = getLocalizedPath(pathname, nextLocale, {
        canonical: false,
      });
      const url = searchString ? `${nextPath}?${searchString}` : nextPath;
      router.push(url);
    },
    [locale, pathname, router, searchString],
  );

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {locales.map((l) => (
        <Button
          variant="link"
          size="link"
          key={l}
          onClick={() => handleSwitch(l)}
          className={cn(
            l === locale ? "text-accent" : "text-muted-foreground",
            linkClassName,
          )}
          aria-label={`Switch to ${l === "en" ? "English" : "Thai"}`}
        >
          {l.toUpperCase()}
        </Button>
      ))}
    </div>
  );
}
