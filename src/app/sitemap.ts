import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;

const PAGES = [
  { path: "", priority: 1, changeFrequency: "monthly" as const },
  { path: "/gallery", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/reviews", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/reviews/new", priority: 0.5, changeFrequency: "yearly" as const },
  { path: "/booking", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/faq", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return PAGES.flatMap((page) => {
    const enPath = page.path || "/";
    const thPath = `/th${page.path}`;

    const alternates = {
      languages: {
        "en-US": `${SITE_URL}${enPath}`,
        "th-TH": `${SITE_URL}${thPath}`,
        "x-default": `${SITE_URL}${enPath}`,
      },
    };

    return [
      {
        url: `${SITE_URL}${enPath}`,
        lastModified: now,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates,
      },
      {
        url: `${SITE_URL}${thPath}`,
        lastModified: now,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates,
      },
    ];
  });
}
