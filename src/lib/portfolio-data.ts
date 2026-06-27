export type PortfolioCategory =
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

export interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  category: PortfolioCategory;
  featured: boolean;
  displayOrder: number;
  width: number;
  height: number;
}

export const PORTFOLIO_CATEGORIES: PortfolioCategory[] = [
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
