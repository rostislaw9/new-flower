"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

export type FaqActionResult =
  | { success: true }
  | { success: false; message: string };

// --- Groups ---

export async function createFaqGroup(
  title: string,
  displayOrder?: number,
): Promise<FaqActionResult> {
  try {
    if (!title.trim()) {
      return { success: false, message: "Group title is required" };
    }

    const count = await prisma.faqGroup.count();
    await prisma.faqGroup.create({
      data: {
        title: title.trim(),
        displayOrder: displayOrder ?? count,
      },
    });

    revalidatePath("/faq");
    revalidatePath("/admin/faq");
    return { success: true };
  } catch (error) {
    console.error("[createFaqGroup] Error:", error);
    return { success: false, message: "Failed to create FAQ group" };
  }
}

export async function updateFaqGroup(
  id: string,
  title: string,
  displayOrder?: number,
): Promise<FaqActionResult> {
  try {
    if (!title.trim()) {
      return { success: false, message: "Group title is required" };
    }

    await prisma.faqGroup.update({
      where: { id },
      data: {
        title: title.trim(),
        ...(displayOrder !== undefined ? { displayOrder } : {}),
      },
    });

    revalidatePath("/faq");
    revalidatePath("/admin/faq");
    return { success: true };
  } catch (error) {
    console.error("[updateFaqGroup] Error:", error);
    return { success: false, message: "Failed to update FAQ group" };
  }
}

export async function deleteFaqGroup(id: string): Promise<FaqActionResult> {
  try {
    await prisma.faqGroup.delete({ where: { id } });

    revalidatePath("/faq");
    revalidatePath("/admin/faq");
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

    await prisma.faqQuestion.create({
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
    revalidatePath("/admin/faq");
    return { success: true };
  } catch (error) {
    console.error("[createFaqQuestion] Error:", error);
    return { success: false, message: "Failed to create FAQ question" };
  }
}

export async function deleteFaqQuestion(id: string): Promise<FaqActionResult> {
  try {
    await prisma.faqQuestion.delete({ where: { id } });

    revalidatePath("/faq");
    revalidatePath("/admin/faq");
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
        questionText,
        answerText,
      },
      create: {
        questionId,
        locale,
        questionText,
        answerText,
      },
    });

    revalidatePath("/faq");
    revalidatePath("/admin/faq");
    return { success: true };
  } catch (error) {
    console.error("[updateFaqTranslation] Error:", error);
    return { success: false, message: "Failed to update translation" };
  }
}
