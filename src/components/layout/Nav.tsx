"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/styled/Button";
import { LanguageSwitcher } from "@/components/styled/LanguageSwitcher";
import { Logo } from "@/components/styled/Logo";
import { cn } from "@/lib/utils";

import { Heading } from "../styled/Typography";

const NAV_LINKS = [
  { href: "/portfolio", key: "portfolio" },
  { href: "/about", key: "about" },
  { href: "/faq", key: "faq" },
  { href: "/contact", key: "contact" },
] as const;

export function Nav() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const getLinkClasses = (
    href: (typeof NAV_LINKS)[number]["href"],
    extra?: string,
  ) =>
    cn(
      pathname === `/${locale}${href}` || pathname === href
        ? "text-accent"
        : "text-muted-foreground",
      extra,
    );

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogoClick = (
    event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
  ) => {
    event.preventDefault();
    setMenuOpen(false);
    const homePath = `/${locale}`;
    const isOnHome = pathname === "/" || pathname === homePath;

    if (isOnHome) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    router.push(homePath);
  };

  return pathname.includes("/admin") ? null : (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-400 ease-premium",
          scrolled
            ? "border-b border-border bg-background/95 backdrop-blur-sm"
            : "bg-transparent",
          menuOpen && "border-none",
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo onClick={handleLogoClick} />

          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-8 md:flex"
          >
            {NAV_LINKS.map(({ href, key }) => (
              <Button
                key={href}
                href={`/${locale}${href}`}
                variant="link"
                size="link"
                className={getLinkClasses(
                  href,
                  locale === "th" ? "text-md" : undefined,
                )}
              >
                <Heading size="xs">{t(key)}</Heading>
              </Button>
            ))}
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            <LanguageSwitcher linkClassName="text-2xs" />
            <Button
              href={`/${locale}/booking`}
              variant="accent"
              size="sm"
              className={locale === "th" ? "text-md" : ""}
            >
              {t("bookNow")}
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon-borderless"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="z-[100] md:hidden"
          >
            <div className="grid justify-center gap-[7px]">
              <span
                className={cn(
                  "h-px w-6 bg-foreground transition-all duration-300 ease-premium",
                  menuOpen && "translate-y-2 rotate-45",
                )}
              />
              <span
                className={cn(
                  "h-px w-6 bg-foreground transition-all duration-300 ease-premium",
                  menuOpen && "bg-transparent",
                )}
              />
              <span
                className={cn(
                  "h-px w-6 bg-foreground transition-all duration-300 ease-premium",
                  menuOpen && "-translate-y-2 -rotate-45",
                )}
              />
            </div>
          </Button>
        </div>
      </header>

      {mounted &&
        createPortal(
          <div
            id="mobile-menu"
            inert={menuOpen ? undefined : true}
            className={cn(
              "fixed inset-0 z-[200] flex flex-col bg-background transition-opacity duration-500 ease-premium md:hidden",
              menuOpen
                ? "pointer-events-auto opacity-100"
                : "pointer-events-none opacity-0",
            )}
          >
            <nav
              aria-label="Mobile navigation"
              className="flex flex-1 flex-col items-center justify-center gap-8"
            >
              {NAV_LINKS.map(({ href, key }) => (
                <Button
                  key={href}
                  href={`/${locale}${href}`}
                  variant="link"
                  className={getLinkClasses(href)}
                  onClick={() => setMenuOpen(false)}
                >
                  <Heading size="headline">{t(key)}</Heading>
                </Button>
              ))}
              <Button
                href={`/${locale}/booking`}
                variant="accent"
                size="lg"
                className={cn(locale === "th" && "text-2xl", "my-8")}
                onClick={() => setMenuOpen(false)}
              >
                {t("bookNow")}
              </Button>
              <LanguageSwitcher />
            </nav>
          </div>,
          document.body,
        )}
    </>
  );
}
