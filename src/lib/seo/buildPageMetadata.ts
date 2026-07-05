import type { Metadata } from "next";

import { getArtistImagesConfig } from "@/lib/artist-images-config";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;

type BuildMetaArgs = {
  locale: string;

  title: string | { absolute: string };
  description: string;
  canonical: string;

  openGraph?: Partial<Metadata["openGraph"]>;
  twitter?: Partial<Metadata["twitter"]>;
};

export async function buildPageMetadata({
  locale,
  title,
  description,
  canonical,
  openGraph,
  twitter,
}: BuildMetaArgs): Promise<Metadata> {
  const artistImagesConfig = await getArtistImagesConfig();

  const rawLogo = artistImagesConfig.logoUrl || "/images/og-image.jpg";

  const logoUrl = rawLogo.startsWith("http")
    ? rawLogo
    : `${SITE_URL}${rawLogo}`;

  return {
    metadataBase: new URL(SITE_URL),

    title,
    description,

    alternates: {
      canonical: `${SITE_URL}${canonical}`,
    },

    openGraph: {
      type: "website",
      locale: locale === "th" ? "th_TH" : "en_US",
      url: `${SITE_URL}${canonical}`,
      siteName: "New Flower Tattoo",
      title: typeof title === "string" ? title : title.absolute,
      description,

      images: [
        {
          url: logoUrl,
          width: 1200,
          height: 630,
        },
      ],

      ...openGraph,
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [logoUrl],

      ...twitter,
    },
  };
}
