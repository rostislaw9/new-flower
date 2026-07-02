import { NextResponse } from "next/server";

import { getAboutBioAdmin, getAboutJourneysAdmin } from "@/lib/about-data";

export async function GET(): Promise<NextResponse> {
  try {
    const [bio, journeys] = await Promise.all([
      getAboutBioAdmin(),
      getAboutJourneysAdmin(),
    ]);
    return NextResponse.json({ bio, journeys });
  } catch (error) {
    console.error("[GET /api/about] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch about data" },
      { status: 500 },
    );
  }
}
