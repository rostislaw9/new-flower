type BreadcrumbItem = {
  name: string;
  item: string;
};

export type BreadcrumbList = {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: {
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }[];
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

export function createBreadcrumbList(items: BreadcrumbItem[]): BreadcrumbList {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(({ name, item }, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name,
      item: `${SITE_URL}${item}`,
    })),
  };
}
