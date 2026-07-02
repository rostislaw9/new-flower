export type GalleryCategory =
  | "Thai Sak Yant"
  | "Japanese Style"
  | "Realism"
  | "Blackwork"
  | "Dotwork"
  | "Neo Traditional"
  | "Botanical"
  | "Fine Line"
  | "Geometric"
  | "Tribal"
  | "Other";

export const GALLERY_CATEGORIES: GalleryCategory[] = [
  "Thai Sak Yant",
  "Japanese Style",
  "Realism",
  "Blackwork",
  "Dotwork",
  "Neo Traditional",
  "Botanical",
  "Fine Line",
  "Geometric",
  "Tribal",
  "Other",
];

export interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  category: GalleryCategory;
  featured: boolean;
  displayOrder: number;
  width: number;
  height: number;
}

export const MAX_FEATURED_ITEMS = 10;
