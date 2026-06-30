import { NextResponse } from "next/server";

import { reorderFeaturedItems } from "@/lib/actions/portfolio";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const ids = Array.isArray(body?.ids) ? body.ids : [];

    const result = await reorderFeaturedItems(ids);
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/portfolio/featured-order] Error", error);
    return NextResponse.json(
      { success: false, message: "Failed to update featured order" },
      { status: 500 },
    );
  }
}
