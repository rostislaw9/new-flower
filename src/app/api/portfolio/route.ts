import { NextResponse } from "next/server";

import { getAdminPortfolioItems } from "@/lib/portfolio-loader";

export async function GET(): Promise<NextResponse> {
  try {
    const items = await getAdminPortfolioItems();

    return NextResponse.json(items);
  } catch (error) {
    console.error("[GET /api/portfolio] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio items" },
      { status: 500 },
    );
  }
}
