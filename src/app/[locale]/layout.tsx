import type { ReactNode } from "react";

import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import NextTopLoader from "nextjs-toploader";

import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { getArtistImagesConfig } from "@/lib/artist-images-config";

const SITE_URL =
  process.env["NEXT_PUBLIC_SITE_URL"] ?? "https://newflower.tattoo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const artistImagesConfig = await getArtistImagesConfig();

  const rawLogo = artistImagesConfig.logoUrl || "/images/og-image.jpg";
  const logoUrl = rawLogo.startsWith("http")
    ? rawLogo
    : `${SITE_URL}${rawLogo}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("title"),
      template: "%s | New Flower Tattoo",
    },
    description: t("description"),
    authors: [{ name: "New Flower Tattoo", url: SITE_URL }],
    keywords: [
      "tattoo artist Phuket",
      "fine line tattoo",
      "blackwork tattoo",
      "botanical tattoo",
      "realism tattoo",
      "tattoo studio Phuket",
      "custom tattoo design",
      "neo traditional tattoo",
      "geometric tattoo",
    ],
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "th" ? "th_TH" : "en_US",
      url: SITE_URL,
      siteName: "New Flower Tattoo",
      title: t("title"),
      description: t("description"),
      images: [
        {
          url: logoUrl,
          width: 1200,
          height: 630,
          alt: "New Flower Tattoo",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@newflowertattoo",
      creator: "@newflowertattoo",
      title: t("title"),
      description: t("description"),
      images: [logoUrl],
    },
    alternates: {
      canonical: SITE_URL,
      languages: {
        "en-US": "/en",
        "th-TH": "/th",
      },
    },
  };
}

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-accent focus:px-4 focus:py-2 focus:text-xs focus:font-semibold focus:uppercase focus:tracking-[0.2em] focus:text-accent-foreground"
      >
        Skip to content
      </a>
      <NextTopLoader color="hsl(var(--accent))" showSpinner={false} />
      <Nav />
      <main id="main-content">{children}</main>
      <Footer />
    </NextIntlClientProvider>
  );
}
