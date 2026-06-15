"use server";

import type { PortfolioCategory, PortfolioItem } from "./portfolio-data";
import { prisma } from "./prisma";

export async function loadPortfolioItems(): Promise<PortfolioItem[]> {
  const items = await prisma.portfolioItem.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    imageUrl: item.imageUrl,
    category: item.category as PortfolioCategory,
    featured: item.featured,
    displayOrder: item.displayOrder,
    width: item.width,
    height: item.height,
  }));
}

export async function getPortfolioItemById(
  id: string,
): Promise<PortfolioItem | null> {
  const item = await prisma.portfolioItem.findUnique({
    where: { id },
  });

  if (!item) return null;

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    imageUrl: item.imageUrl,
    category: item.category as PortfolioCategory,
    featured: item.featured,
    displayOrder: item.displayOrder,
    width: item.width,
    height: item.height,
  };
}

export async function getPortfolioItems(
  category?: PortfolioCategory,
): Promise<PortfolioItem[]> {
  const items = await loadPortfolioItems();
  if (category === undefined) return items;
  return items.filter((item) => item.category === category);
}

export async function getFeaturedItems(limit = 8): Promise<PortfolioItem[]> {
  const items = await loadPortfolioItems();
  return items.filter((item) => item.featured).slice(0, limit);
}
