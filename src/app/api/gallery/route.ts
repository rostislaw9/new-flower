import { NextResponse } from "next/server";

import {
  getAdminGalleryItems,
  getAdminGalleryItemsPaginated,
} from "@/lib/gallery-loader";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const offsetParam = searchParams.get("offset");

    if (limitParam || offsetParam) {
      const limit = limitParam
        ? Math.min(Math.max(1, Number(limitParam)), 50)
        : 15;
      const offset = offsetParam ? Math.max(0, Number(offsetParam)) : 0;

      if (Number.isNaN(limit) || Number.isNaN(offset)) {
        return NextResponse.json(
          { error: "Invalid limit or offset" },
          { status: 400 },
        );
      }

      const page = await getAdminGalleryItemsPaginated(offset, limit);
      return NextResponse.json(page);
    }

    const items = await getAdminGalleryItems();
    return NextResponse.json(items);
  } catch (error) {
    console.error("[GET /api/gallery] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery items" },
      { status: 500 },
    );
  }
}
