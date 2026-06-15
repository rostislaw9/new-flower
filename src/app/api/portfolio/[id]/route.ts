import { NextResponse } from "next/server";

import { getPortfolioItemById } from "@/lib/portfolio-loader";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const item = await getPortfolioItemById(id);

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("[GET /api/portfolio/[id]] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio item" },
      { status: 500 },
    );
  }
}
