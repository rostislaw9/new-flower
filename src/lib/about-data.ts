import { prisma } from "@/lib/prisma";

export interface AboutBioData {
  id: string;
  title: string;
  description: string;
}

export async function getAboutBio(
  locale: string,
): Promise<AboutBioData | null> {
  const bio = await prisma.aboutBio.findFirst({
    include: {
      translations: {
        where: { locale },
      },
    },
  });

  if (!bio || bio.translations.length === 0) return null;

  const t = bio.translations[0]!;
  return {
    id: bio.id,
    title: t.title,
    description: t.description,
  };
}

export interface AboutJourneyData {
  id: string;
  year: string;
  title: string;
  description: string;
}

export async function getAboutJourneys(
  locale: string,
): Promise<AboutJourneyData[]> {
  const journeys = await prisma.aboutJourney.findMany({
    orderBy: { displayOrder: "asc" },
    include: {
      translations: {
        where: { locale },
      },
    },
  });

  return journeys
    .filter((j) => j.translations.length > 0)
    .map((j) => {
      const t = j.translations[0]!;
      return {
        id: j.id,
        year: j.year,
        title: t.title,
        description: t.description,
      };
    });
}

// --- Admin data (all translations) ---

export interface AboutBioTranslationData {
  id: string;
  locale: string;
  title: string;
  description: string;
}

export interface AboutBioAdminData {
  id: string;
  translations: AboutBioTranslationData[];
}

export async function getAboutBioAdmin(): Promise<AboutBioAdminData | null> {
  const bio = await prisma.aboutBio.findFirst({
    include: {
      translations: true,
    },
  });

  if (!bio) return null;

  return {
    id: bio.id,
    translations: bio.translations.map((t) => ({
      id: t.id,
      locale: t.locale,
      title: t.title,
      description: t.description,
    })),
  };
}

export interface AboutJourneyTranslationData {
  id: string;
  locale: string;
  title: string;
  description: string;
}

export interface AboutJourneyAdminData {
  id: string;
  displayOrder: number;
  year: string;
  translations: AboutJourneyTranslationData[];
}

export async function getAboutJourneysAdmin(): Promise<
  AboutJourneyAdminData[]
> {
  const journeys = await prisma.aboutJourney.findMany({
    orderBy: { displayOrder: "asc" },
    include: {
      translations: true,
    },
  });

  return journeys.map((j) => ({
    id: j.id,
    displayOrder: j.displayOrder,
    year: j.year,
    translations: j.translations.map((t) => ({
      id: t.id,
      locale: t.locale,
      title: t.title,
      description: t.description,
    })),
  }));
}
