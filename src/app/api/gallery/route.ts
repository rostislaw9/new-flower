import { NextResponse } from "next/server";

import { getAdminGalleryItems } from "@/lib/gallery-loader";

export async function GET(): Promise<NextResponse> {
  try {
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
