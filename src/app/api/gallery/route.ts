import { NextResponse } from "next/server";

import { GALLERY_CATEGORIES, type GalleryCategory } from "@/lib/gallery-data";
import {
  countFeaturedItems,
  countGalleryItems,
  getGalleryItems,
} from "@/lib/gallery-loader";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

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
  const hasPagination = searchParams.has("limit") || searchParams.has("offset");
  const limit = parseLimit(searchParams.get("limit"));
  const offset = parseOffset(searchParams.get("offset"));
  const category = parseCategory(searchParams.get("category"));
  const featuredFirst = searchParams.get("featuredFirst") === "true";

  try {
    if (!hasPagination) {
      const items = await getGalleryItems({
        category: category ?? undefined,
        featuredFirst,
      });
      return NextResponse.json(items);
    }

    const [items, total] = await Promise.all([
      getGalleryItems({
        take: limit,
        skip: offset,
        category: category ?? undefined,
        featuredFirst,
      }),
      countGalleryItems(category ?? undefined),
    ]);

    const nextOffset = offset + items.length;
    const hasMore = nextOffset < total;

    const response: Record<string, unknown> = {
      items,
      total,
      hasMore,
      nextOffset,
    };

    if (featuredFirst) {
      response.featuredCount = await countFeaturedItems();
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("[GET /api/gallery] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery items" },
      { status: 500 },
    );
  }
}
