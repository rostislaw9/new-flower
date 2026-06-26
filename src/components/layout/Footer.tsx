"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/styled/Button";
import { Logo } from "@/components/styled/Logo";
import { Eyebrow, Text } from "@/components/styled/Typography";
import { Separator } from "@/components/ui/separator";

const FOOTER_LINKS = [
  { href: "/portfolio", labelKey: "links.portfolio" },
  { href: "/about", labelKey: "links.about" },
  { href: "/faq", labelKey: "links.faq" },
  { href: "/contact", labelKey: "links.contact" },
  { href: "/booking", labelKey: "links.booking" },
] as const;

const SOCIAL_LINKS = [
  { href: "https://www.instagram.com/tattoo_by_newflower", label: "Instagram" },
  { href: "https://www.facebook.com/NewFlowerTattoo", label: "Facebook" },
  { href: "https://wa.me/66968076646", label: "WhatsApp" },
] as const;

interface FooterProps {
  locale: string;
}

export function Footer({ locale }: FooterProps) {
  const t = useTranslations("footer");
  const pathname = usePathname();

  const year = new Date().getFullYear();

  return pathname.includes("/admin") ? null : (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl space-y-16 px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div className="flex flex-col items-start gap-4">
            <Logo size="lg" />
            <Text muted size="sm" className="max-w-xs">
              {t("text")}
            </Text>
          </div>

          <div className="flex flex-row justify-between">
            <div className="flex flex-col gap-4">
              <Eyebrow>{t("navigation")}</Eyebrow>
              <nav
                aria-label="Footer navigation"
                className="flex flex-col gap-3"
              >
                {FOOTER_LINKS.map(({ href, labelKey }) => (
                  <Link
                    key={href}
                    href={`/${locale}${href}`}
                    className="font-sans text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground"
                  >
                    {t(labelKey)}
                  </Link>
                ))}
              </nav>
              <Button
                variant="accent"
                size="sm"
                href={`/${locale}/reviews/new`}
              >
                {t("leaveReview")}
              </Button>
            </div>

            <div className="flex flex-col gap-4">
              <Eyebrow>{t("connect")}</Eyebrow>
              <nav aria-label="Social links" className="flex flex-col gap-3">
                {SOCIAL_LINKS.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-sans text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Separator />
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <Text muted size="xs">
              {t("copyright", { year })}
            </Text>
            <Text className="text-muted-foreground/50" size="xs">
              {t("crafted")}
            </Text>
          </div>
        </div>
      </div>
    </footer>
  );
}
