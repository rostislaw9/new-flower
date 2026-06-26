"use server";

import type { PortfolioCategory, PortfolioItem } from "./portfolio-data";
import { prisma } from "./prisma";

function mapPrismaItem(item: {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  category: string;
  featured: boolean;
  displayOrder: number;
  width: number;
  height: number;
}): PortfolioItem {
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

export async function loadPortfolioItems(): Promise<PortfolioItem[]> {
  const items = await prisma.portfolioItem.findMany({
    orderBy: { createdAt: "desc" },
  });

  return items.map(mapPrismaItem);
}

export async function getPortfolioItemById(
  id: string,
): Promise<PortfolioItem | null> {
  const item = await prisma.portfolioItem.findUnique({
    where: { id },
  });

  if (!item) return null;

  return mapPrismaItem(item);
}

export async function getFeaturedItems(limit = 8): Promise<PortfolioItem[]> {
  const items = await prisma.portfolioItem.findMany({
    where: { featured: true },
    orderBy: { displayOrder: "asc" },
  });
  return items.map(mapPrismaItem).slice(0, limit);
}

export async function getAdminPortfolioItems(): Promise<PortfolioItem[]> {
  const items = await prisma.portfolioItem.findMany({
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  return items.map(mapPrismaItem);
}
