export type PortfolioCategory =
  | "Fine Line"
  | "Blackwork"
  | "Botanical"
  | "Realism"
  | "Neo Traditional"
  | "Geometric"
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
  "Fine Line",
  "Blackwork",
  "Botanical",
  "Realism",
  "Neo Traditional",
  "Geometric",
  "Other",
];
