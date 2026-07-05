"use server";

import { revalidatePath } from "next/cache";

import { getAboutBioAdmin, getAboutJourneysAdmin } from "@/lib/about-data";
import { prisma } from "@/lib/prisma";

export type AboutActionResult =
  | { success: true; id?: string }
  | { success: false; message: string };

export async function fetchAboutAdminData() {
  const [bio, journeys] = await Promise.all([
    getAboutBioAdmin(),
    getAboutJourneysAdmin(),
  ]);
  return { bio, journeys };
}

// --- Bio ---

export async function createAboutBio(
  locale: string,
  title: string,
  description: string,
): Promise<AboutActionResult> {
  try {
    if (!title.trim()) {
      return { success: false, message: "Title is required" };
    }

    const existing = await prisma.aboutBio.findFirst();
    if (existing) {
      return { success: false, message: "Bio already exists" };
    }

    const bio = await prisma.aboutBio.create({
      data: {
        translations: {
          create: [
            { locale, title: title.trim(), description: description.trim() },
            {
              locale: locale === "en" ? "th" : "en",
              title: "",
              description: "",
            },
          ],
        },
      },
    });

    revalidatePath("/about");
    return { success: true, id: bio.id };
  } catch (error) {
    console.error("[createAboutBio] Error:", error);
    return { success: false, message: "Failed to create bio" };
  }
}

export async function updateAboutBioTranslation(
  bioId: string,
  locale: string,
  title: string,
  description: string,
): Promise<AboutActionResult> {
  try {
    if (!title.trim()) {
      return { success: false, message: "Title is required" };
    }

    await prisma.aboutBioTranslation.upsert({
      where: {
        bioId_locale: { bioId, locale },
      },
      update: {
        title: title.trim(),
        description: description.trim(),
      },
      create: {
        bioId,
        locale,
        title: title.trim(),
        description: description.trim(),
      },
    });

    revalidatePath("/about");
    return { success: true };
  } catch (error) {
    console.error("[updateAboutBioTranslation] Error:", error);
    return { success: false, message: "Failed to update bio translation" };
  }
}

// --- Journey ---

export async function createAboutJourney(): Promise<AboutActionResult> {
  try {
    const count = await prisma.aboutJourney.count();
    const journey = await prisma.aboutJourney.create({
      data: {
        displayOrder: count,
        year: "",
        translations: {
          create: [
            { locale: "en", title: "", description: "" },
            { locale: "th", title: "", description: "" },
          ],
        },
      },
    });

    revalidatePath("/about");
    return { success: true, id: journey.id };
  } catch (error) {
    console.error("[createAboutJourney] Error:", error);
    return { success: false, message: "Failed to create journey entry" };
  }
}

export async function deleteAboutJourney(
  id: string,
): Promise<AboutActionResult> {
  try {
    await prisma.aboutJourney.delete({ where: { id } });
    revalidatePath("/about");
    return { success: true };
  } catch (error) {
    console.error("[deleteAboutJourney] Error:", error);
    return { success: false, message: "Failed to delete journey entry" };
  }
}

export async function updateAboutJourneyYear(
  journeyId: string,
  year: string,
): Promise<AboutActionResult> {
  try {
    await prisma.aboutJourney.update({
      where: { id: journeyId },
      data: { year: year.trim() },
    });

    revalidatePath("/about");
    return { success: true };
  } catch (error) {
    console.error("[updateAboutJourneyYear] Error:", error);
    return { success: false, message: "Failed to update journey year" };
  }
}

export async function updateAboutJourneyTranslation(
  journeyId: string,
  locale: string,
  title: string,
  description: string,
): Promise<AboutActionResult> {
  try {
    if (!title.trim()) {
      return { success: false, message: "Title is required" };
    }

    await prisma.aboutJourneyTranslation.upsert({
      where: {
        journeyId_locale: { journeyId, locale },
      },
      update: {
        title: title.trim(),
        description: description.trim(),
      },
      create: {
        journeyId,
        locale,
        title: title.trim(),
        description: description.trim(),
      },
    });

    revalidatePath("/about");
    return { success: true };
  } catch (error) {
    console.error("[updateAboutJourneyTranslation] Error:", error);
    return { success: false, message: "Failed to update journey translation" };
  }
}
