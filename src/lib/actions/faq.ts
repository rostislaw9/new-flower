"use server";

import { revalidatePath } from "next/cache";

import { getAllFaqGroups } from "@/lib/faq-data";
import { prisma } from "@/lib/prisma";

export type FaqActionResult =
  | { success: true; id?: string }
  | { success: false; message: string };

export async function fetchAllFaqGroups() {
  return getAllFaqGroups();
}

// --- Groups ---

export async function createFaqGroup(
  titleEn: string,
  titleTh?: string,
): Promise<FaqActionResult> {
  try {
    if (!titleEn.trim()) {
      return { success: false, message: "Group title is required" };
    }

    const count = await prisma.faqGroup.count();
    const group = await prisma.faqGroup.create({
      data: {
        displayOrder: count,
        translations: {
          create: [
            { locale: "en", title: titleEn.trim() },
            { locale: "th", title: (titleTh ?? titleEn).trim() },
          ],
        },
      },
    });

    revalidatePath("/faq");
    return { success: true, id: group.id };
  } catch (error) {
    console.error("[createFaqGroup] Error:", error);
    return { success: false, message: "Failed to create FAQ group" };
  }
}

export async function updateFaqGroupTitle(
  groupId: string,
  locale: string,
  title: string,
): Promise<FaqActionResult> {
  try {
    if (!title.trim()) {
      return { success: false, message: "Group title is required" };
    }

    await prisma.faqGroupTranslation.upsert({
      where: {
        groupId_locale: { groupId, locale },
      },
      update: { title: title.trim() },
      create: { groupId, locale, title: title.trim() },
    });

    revalidatePath("/faq");
    return { success: true };
  } catch (error) {
    console.error("[updateFaqGroupTitle] Error:", error);
    return { success: false, message: "Failed to update FAQ group title" };
  }
}

export async function deleteFaqGroup(id: string): Promise<FaqActionResult> {
  try {
    await prisma.faqGroup.delete({ where: { id } });

    revalidatePath("/faq");
    return { success: true };
  } catch (error) {
    console.error("[deleteFaqGroup] Error:", error);
    return { success: false, message: "Failed to delete FAQ group" };
  }
}

// --- Questions ---

export async function createFaqQuestion(
  groupId: string,
  displayOrder?: number,
): Promise<FaqActionResult> {
  try {
    const count = await prisma.faqQuestion.count({
      where: { groupId },
    });

    const question = await prisma.faqQuestion.create({
      data: {
        groupId,
        displayOrder: displayOrder ?? count,
        translations: {
          create: [
            { locale: "en", questionText: "", answerText: "" },
            { locale: "th", questionText: "", answerText: "" },
          ],
        },
      },
    });

    revalidatePath("/faq");
    return { success: true, id: question.id };
  } catch (error) {
    console.error("[createFaqQuestion] Error:", error);
    return { success: false, message: "Failed to create FAQ question" };
  }
}

export async function deleteFaqQuestion(id: string): Promise<FaqActionResult> {
  try {
    await prisma.faqQuestion.delete({ where: { id } });

    revalidatePath("/faq");
    return { success: true };
  } catch (error) {
    console.error("[deleteFaqQuestion] Error:", error);
    return { success: false, message: "Failed to delete FAQ question" };
  }
}

// --- Translations ---

export async function updateFaqTranslation(
  questionId: string,
  locale: string,
  questionText: string,
  answerText: string,
): Promise<FaqActionResult> {
  try {
    await prisma.faqTranslation.upsert({
      where: {
        questionId_locale: { questionId, locale },
      },
      update: {
        questionText: questionText.trim(),
        answerText: answerText.trim(),
      },
      create: {
        questionId,
        locale,
        questionText: questionText.trim(),
        answerText: answerText.trim(),
      },
    });

    revalidatePath("/faq");
    return { success: true };
  } catch (error) {
    console.error("[updateFaqTranslation] Error:", error);
    return { success: false, message: "Failed to update translation" };
  }
}
