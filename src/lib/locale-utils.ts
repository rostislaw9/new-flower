import { type Locale, defaultLocale, locales } from "@/i18n/config";

export const LOCALE_STORAGE_KEY = "preferredLocale";
export const PREFERRED_LOCALE_EVENT = "preferred-locale-change";

export function isSupportedLocale(
  value: string | null | undefined,
): value is Locale {
  return (
    value !== null && value !== undefined && locales.includes(value as Locale)
  );
}

function normalizePathname(pathname: string | null | undefined): string {
  if (!pathname) {
    return "/";
  }
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

export function splitPathname(pathname: string | null | undefined) {
  const normalized = normalizePathname(pathname);
  const segments = normalized.split("/").filter(Boolean);

  if (segments.length === 0) {
    return { locale: null as Locale | null, pathWithoutLocale: "/" };
  }

  const [first, ...rest] = segments;

  if (isSupportedLocale(first)) {
    const pathWithoutLocale = rest.length ? `/${rest.join("/")}` : "/";
    return { locale: first, pathWithoutLocale };
  }

  return { locale: null as Locale | null, pathWithoutLocale: normalized };
}

function buildLocalizedPath(
  pathWithoutLocale: string,
  locale: Locale,
  canonical: boolean,
) {
  const normalized = normalizePathname(pathWithoutLocale);
  if (locale === defaultLocale && canonical) {
    return normalized;
  }
  const suffix = normalized === "/" ? "" : normalized;
  return `/${locale}${suffix}`;
}

export function getLocalizedPath(
  pathname: string,
  newLocale: Locale,
  options?: { canonical?: boolean },
): string {
  const { pathWithoutLocale } = splitPathname(pathname);
  const canonical = options?.canonical ?? true;
  return buildLocalizedPath(pathWithoutLocale, newLocale, canonical);
}

export function persistPreferredLocale(locale: Locale) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<Locale>(PREFERRED_LOCALE_EVENT, { detail: locale }),
  );
}
