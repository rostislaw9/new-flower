import { NextResponse } from "next/server";

import { GALLERY_CATEGORIES, type GalleryCategory } from "@/lib/gallery-data";
import { countGalleryItems, loadGalleryItems } from "@/lib/gallery-loader";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 20;

function parseLimit(param: string | null): number {
  if (!param) return DEFAULT_LIMIT;
  const parsed = Number(param);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return DEFAULT_LIMIT;
  }
  return Math.min(MAX_LIMIT, parsed);
}

function parseOffset(param: string | null): number {
  if (!param) return 0;
  const parsed = Number(param);
  if (Number.isNaN(parsed) || parsed < 0) {
    return 0;
  }
  return parsed;
}

function parseCategory(param: string | null): GalleryCategory | null {
  if (!param) return null;
  return GALLERY_CATEGORIES.includes(param as GalleryCategory)
    ? (param as GalleryCategory)
    : null;
}

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const limit = parseLimit(searchParams.get("limit"));
  const offset = parseOffset(searchParams.get("offset"));
  const category = parseCategory(searchParams.get("category"));

  try {
    const [items, total] = await Promise.all([
      loadGalleryItems({
        take: limit,
        skip: offset,
        category: category ?? undefined,
      }),
      countGalleryItems(category ?? undefined),
    ]);

    const nextOffset = offset + items.length;
    const hasMore = nextOffset < total;

    return NextResponse.json({
      items,
      total,
      hasMore,
      nextOffset,
    });
  } catch (error) {
    console.error("[GET /api/gallery/public] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery items" },
      { status: 500 },
    );
  }
}
