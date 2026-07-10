"use server";

import { revalidatePath } from "next/cache";

import { defaultLocale, locales } from "@/i18n/config";
import { prisma } from "@/lib/prisma";
import { type ReviewInput, reviewSchema } from "@/lib/schemas/review";

export type ReviewFormErrors = Partial<Record<keyof ReviewInput, string[]>>;

export type ReviewFormState =
  | { status: "idle" }
  | { status: "error"; fieldErrors: ReviewFormErrors; message?: string }
  | { status: "success" };

function revalidateHomePages() {
  locales.forEach((locale) => {
    const path = locale === defaultLocale ? "/" : `/${locale}`;
    revalidatePath(path);
  });
}

function revalidateAdminReviews() {
  locales.forEach((locale) => {
    const path =
      locale === defaultLocale ? "/admin/reviews" : `/${locale}/admin/reviews`;
    revalidatePath(path);
  });
}

function revalidateReviewsPage() {
  locales.forEach((locale) => {
    const path = locale === defaultLocale ? "/reviews" : `/${locale}/reviews`;
    revalidatePath(path);
  });
}

export async function submitReview(
  _prevState: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const raw = {
    clientName: formData.get("clientName") ?? "",
    clientEmail: formData.get("clientEmail") ?? undefined,
    rating: formData.get("rating") ?? "",
    text: formData.get("text") ?? "",
  };

  const normalized = {
    ...raw,
    clientEmail:
      typeof raw.clientEmail === "string" && raw.clientEmail.trim().length === 0
        ? undefined
        : raw.clientEmail,
  };

  const parsed = reviewSchema.safeParse(normalized);

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: parsed.error.flatten().fieldErrors as ReviewFormErrors,
    };
  }

  try {
    await prisma.review.create({
      data: {
        clientName: parsed.data.clientName,
        clientEmail: parsed.data.clientEmail ?? null,
        rating: parsed.data.rating,
        text: parsed.data.text,
      },
    });

    revalidateAdminReviews();
    revalidateHomePages();

    return { status: "success" };
  } catch (error) {
    console.error("[submitReview] Error creating review", error);
    return {
      status: "error",
      fieldErrors: {},
      message: "Unable to save your review. Please try again later.",
    };
  }
}

export async function setReviewFeatured(
  id: string,
  featured: boolean,
): Promise<{ success: boolean; message?: string }> {
  try {
    await prisma.$transaction(async (tx) => {
      if (!featured) {
        await tx.review.update({ where: { id }, data: { featured: false } });
        return;
      }

      const currentlyFeatured = await tx.review.findMany({
        where: { featured: true },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      });

      const isAlreadyFeatured = currentlyFeatured.some(
        (review) => review.id === id,
      );

      if (isAlreadyFeatured) {
        return;
      }

      await tx.review.update({ where: { id }, data: { featured: true } });

      const MAX_FEATURED = 3;
      const overflowCount = Math.max(
        0,
        currentlyFeatured.length - (MAX_FEATURED - 1),
      );

      if (overflowCount > 0) {
        const toUnfeatureIds = currentlyFeatured
          .slice(0, overflowCount)
          .map((review) => review.id)
          .filter((reviewId) => reviewId !== id);

        if (toUnfeatureIds.length > 0) {
          await tx.review.updateMany({
            where: { id: { in: toUnfeatureIds } },
            data: { featured: false },
          });
        }
      }
    });

    revalidateAdminReviews();
    revalidateHomePages();
    revalidateReviewsPage();

    return { success: true };
  } catch (error) {
    console.error("[setReviewFeatured] Error", error);
    return { success: false, message: "Failed to update featured state" };
  }
}

export async function deleteReview(
  id: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    await prisma.review.delete({ where: { id } });

    revalidateAdminReviews();
    revalidateHomePages();
    revalidateReviewsPage();

    return { success: true };
  } catch (error) {
    console.error("[deleteReview] Error", error);
    return { success: false, message: "Failed to delete review" };
  }
}

export async function setReviewVisible(
  id: string,
  visible: boolean,
): Promise<{ success: boolean; message?: string }> {
  try {
    await prisma.review.update({ where: { id }, data: { visible } });

    revalidateAdminReviews();
    revalidateReviewsPage();

    return { success: true };
  } catch (error) {
    console.error("[setReviewVisible] Error", error);
    return { success: false, message: "Failed to update visibility" };
  }
}
