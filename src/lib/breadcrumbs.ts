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

export function createBreadcrumbList(items: BreadcrumbItem[]): BreadcrumbList {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(({ name, item }, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name,
      item,
    })),
  };
}
