export type PortfolioCategory =
  | "Blackwork"
  | "Thai Sak Yant"
  | "Neo Traditional"
  | "Japanese"
  | "Realism"
  | "Botanical"
  | "Fine Line"
  | "Geometric"
  | "Tribe"
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
  "Blackwork",
  "Thai Sak Yant",
  "Neo Traditional",
  "Japanese",
  "Realism",
  "Botanical",
  "Fine Line",
  "Geometric",
  "Tribe",
  "Other",
];
