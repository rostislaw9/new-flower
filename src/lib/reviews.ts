import { unstable_noStore as noStore } from "next/cache";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const REVIEWS_PER_PAGE = 10;

function toDate(value?: string, endOfDay?: boolean) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }
  return date;
}

export async function getFeaturedReviews(limit = 3) {
  noStore();
  return prisma.review.findMany({
    where: { featured: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getVisibleReviews(limit?: number) {
  noStore();
  return prisma.review.findMany({
    where: { visible: true },
    orderBy: { createdAt: "desc" },
    ...(limit ? { take: limit } : {}),
  });
}

interface GetReviewsInput {
  page: number;
  rating?: number;
  search?: string;
  submittedFrom?: string;
  submittedTo?: string;
}

export async function getReviews({
  page,
  rating,
  search,
  submittedFrom,
  submittedTo,
}: GetReviewsInput) {
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

  const createdFrom = toDate(submittedFrom);
  const createdTo = toDate(submittedTo, true);
  if (createdFrom || createdTo) {
    where.createdAt = {};
    if (createdFrom) {
      where.createdAt.gte = createdFrom;
    }
    if (createdTo) {
      where.createdAt.lte = createdTo;
    }
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
