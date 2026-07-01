import { prisma } from "@/lib/prisma";

export interface FaqSectionData {
  id: string;
  title: string;
  questions: {
    id: string;
    question: string;
    answer: string;
  }[];
}

export async function getFaqSections(
  locale: string,
): Promise<FaqSectionData[]> {
  const groups = await prisma.faqGroup.findMany({
    orderBy: { displayOrder: "asc" },
    include: {
      questions: {
        orderBy: { displayOrder: "asc" },
        include: {
          translations: {
            where: { locale },
          },
        },
      },
    },
  });

  return groups.map((group) => ({
    id: group.id,
    title: group.title,
    questions: group.questions
      .filter((q) => q.translations.length > 0)
      .map((q) => ({
        id: q.id,
        question: q.translations[0]!.questionText,
        answer: q.translations[0]!.answerText,
      })),
  }));
}

export interface FaqGroupWithQuestions {
  id: string;
  title: string;
  displayOrder: number;
  questions: {
    id: string;
    displayOrder: number;
    translations: {
      id: string;
      locale: string;
      questionText: string;
      answerText: string;
    }[];
  }[];
}

export async function getAllFaqGroups(): Promise<FaqGroupWithQuestions[]> {
  const groups = await prisma.faqGroup.findMany({
    orderBy: { displayOrder: "asc" },
    include: {
      questions: {
        orderBy: { displayOrder: "asc" },
        include: {
          translations: true,
        },
      },
    },
  });

  return groups.map((group) => ({
    id: group.id,
    title: group.title,
    displayOrder: group.displayOrder,
    questions: group.questions.map((q) => ({
      id: q.id,
      displayOrder: q.displayOrder,
      translations: q.translations.map((t) => ({
        id: t.id,
        locale: t.locale,
        questionText: t.questionText,
        answerText: t.answerText,
      })),
    })),
  }));
}
