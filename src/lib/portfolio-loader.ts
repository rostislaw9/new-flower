"use server";

import {
  MAX_FEATURED_ITEMS,
  PORTFOLIO_CATEGORIES,
  type PortfolioCategory,
  type PortfolioItem,
} from "./portfolio-data";
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

interface LoadPortfolioOptions {
  skip?: number;
  take?: number;
  category?: PortfolioCategory | undefined;
}

export async function loadPortfolioItems(
  options?: LoadPortfolioOptions,
): Promise<PortfolioItem[]> {
  const where = options?.category ? { category: options.category } : undefined;
  const query: Parameters<typeof prisma.portfolioItem.findMany>[0] = {
    orderBy: { createdAt: "desc" },
  };

  if (where) {
    query.where = where;
  }
  if (typeof options?.skip === "number") {
    query.skip = options.skip;
  }
  if (typeof options?.take === "number") {
    query.take = options.take;
  }

  const items = await prisma.portfolioItem.findMany(query);

  return items.map(mapPrismaItem);
}

export async function countPortfolioItems(
  category?: PortfolioCategory | undefined,
): Promise<number> {
  const where = category ? { category } : undefined;
  const query: Parameters<typeof prisma.portfolioItem.count>[0] = {};
  if (where) {
    query.where = where;
  }
  return prisma.portfolioItem.count(query);
}

export async function getPortfolioCategoryCounts(): Promise<
  Record<PortfolioCategory, number>
> {
  const grouped = await prisma.portfolioItem.groupBy({
    by: ["category"],
    _count: { category: true },
  });

  return PORTFOLIO_CATEGORIES.reduce<Record<PortfolioCategory, number>>(
    (acc, category) => {
      const match = grouped.find((item) => item.category === category);
      acc[category] = match?._count.category ?? 0;
      return acc;
    },
    {} as Record<PortfolioCategory, number>,
  );
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

export async function getPortfolioItems(
  category?: PortfolioCategory,
): Promise<PortfolioItem[]> {
  const items = await loadPortfolioItems();
  if (category === undefined) return items;
  return items.filter((item) => item.category === category);
}

export async function getFeaturedItems(
  limit = MAX_FEATURED_ITEMS,
): Promise<PortfolioItem[]> {
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
