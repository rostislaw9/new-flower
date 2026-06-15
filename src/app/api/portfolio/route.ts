import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(): Promise<NextResponse> {
  try {
    const items = await prisma.portfolioItem.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("[GET /api/portfolio] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio items" },
      { status: 500 },
    );
  }
}
