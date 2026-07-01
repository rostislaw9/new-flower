import { NextResponse } from "next/server";

import { getAllFaqGroups } from "@/lib/faq-data";

export async function GET(): Promise<NextResponse> {
  try {
    const groups = await getAllFaqGroups();
    return NextResponse.json(groups);
  } catch (error) {
    console.error("[GET /api/faq] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch FAQ data" },
      { status: 500 },
    );
  }
}
