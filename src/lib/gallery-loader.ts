"use server";

import {
  GALLERY_CATEGORIES,
  type GalleryCategory,
  type GalleryItem,
  MAX_FEATURED_ITEMS,
} from "./gallery-data";
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
}): GalleryItem {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    imageUrl: item.imageUrl,
    category: item.category as GalleryCategory,
    featured: item.featured,
    displayOrder: item.displayOrder,
    width: item.width,
    height: item.height,
  };
}

interface LoadGalleryOptions {
  skip?: number;
  take?: number;
  category?: GalleryCategory | undefined;
}

export async function loadGalleryItems(
  options?: LoadGalleryOptions,
): Promise<GalleryItem[]> {
  const where = options?.category ? { category: options.category } : undefined;
  const query: Parameters<typeof prisma.galleryItem.findMany>[0] = {
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
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

  const items = await prisma.galleryItem.findMany(query);

  return items.map(mapPrismaItem);
}

export async function countGalleryItems(
  category?: GalleryCategory | undefined,
): Promise<number> {
  const where = category ? { category } : undefined;
  const query: Parameters<typeof prisma.galleryItem.count>[0] = {};
  if (where) {
    query.where = where;
  }
  return prisma.galleryItem.count(query);
}

export async function getGalleryCategoryCounts(): Promise<
  Record<GalleryCategory, number>
> {
  const grouped = await prisma.galleryItem.groupBy({
    by: ["category"],
    _count: { category: true },
  });

  return GALLERY_CATEGORIES.reduce<Record<GalleryCategory, number>>(
    (acc, category) => {
      const match = grouped.find((item) => item.category === category);
      acc[category] = match?._count.category ?? 0;
      return acc;
    },
    {} as Record<GalleryCategory, number>,
  );
}

export async function getGalleryItemById(
  id: string,
): Promise<GalleryItem | null> {
  const item = await prisma.galleryItem.findUnique({
    where: { id },
  });

  if (!item) return null;

  return mapPrismaItem(item);
}

export async function getGalleryItems(
  category?: GalleryCategory,
): Promise<GalleryItem[]> {
  const items = await loadGalleryItems();
  if (category === undefined) return items;
  return items.filter((item) => item.category === category);
}

export async function getFeaturedItems(
  limit = MAX_FEATURED_ITEMS,
): Promise<GalleryItem[]> {
  const items = await prisma.galleryItem.findMany({
    where: { featured: true },
    orderBy: { displayOrder: "asc" },
  });
  return items.map(mapPrismaItem).slice(0, limit);
}

export async function getAdminGalleryItems(): Promise<GalleryItem[]> {
  const [featured, regular] = await Promise.all([
    prisma.galleryItem.findMany({
      where: { featured: true },
      orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
    }),
    prisma.galleryItem.findMany({
      where: { featured: false },
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    }),
  ]);

  return [...featured, ...regular].map(mapPrismaItem);
}
