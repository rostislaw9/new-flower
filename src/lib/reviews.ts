import { unstable_noStore as noStore } from "next/cache";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const REVIEWS_PER_PAGE = 10;

export async function getFeaturedReviews(limit = 3) {
  noStore();
  return prisma.review.findMany({
    where: { featured: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

interface GetReviewsInput {
  page: number;
  rating?: number;
  search?: string;
}

export async function getReviews({ page, rating, search }: GetReviewsInput) {
  noStore();
  const where: Prisma.ReviewWhereInput = {};

  if (rating && rating >= 1 && rating <= 5) {
    where.rating = rating;
  }

  if (search?.trim()) {
    const query = search.trim();
    where.OR = [
      { clientName: { contains: query, mode: "insensitive" } },
      { clientEmail: { contains: query, mode: "insensitive" } },
    ];
  }

  const total = await prisma.review.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / REVIEWS_PER_PAGE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const skip = (safePage - 1) * REVIEWS_PER_PAGE;

  const reviews = await prisma.review.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip,
    take: REVIEWS_PER_PAGE,
  });

  return {
    reviews,
    total,
    totalPages,
    currentPage: safePage,
  };
}
