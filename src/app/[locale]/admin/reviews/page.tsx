import { getTranslations } from "next-intl/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ReviewActions } from "@/components/admin/reviews/ReviewActions";
import { ReviewsFilters } from "@/components/admin/reviews/ReviewsFilters";
import { Badge } from "@/components/styled/Badge";
import { Text } from "@/components/styled/Typography";
import { Card, CardContent } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type Locale, defaultLocale } from "@/i18n/config";
import { formatDateTime } from "@/lib/date-utils";
import { getLocalizedPath, isSupportedLocale } from "@/lib/locale-utils";
import { getReviews } from "@/lib/reviews";
import { cn } from "@/lib/utils";

interface AdminReviewsPageProps {
  params: Promise<{ locale?: string }>;
  searchParams: Promise<{ page?: string; search?: string; rating?: string }>;
}

const ratingOptions = [1, 2, 3, 4, 5];

export const revalidate = 0;

export default async function AdminReviewsPage({
  params,
  searchParams,
}: AdminReviewsPageProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isSupportedLocale(rawLocale)
    ? rawLocale
    : defaultLocale;
  const resolvedSearchParams = await searchParams;

  const page = Math.max(1, parseInt(resolvedSearchParams.page ?? "1", 10) || 1);
  const search = resolvedSearchParams.search?.toString() ?? "";
  const ratingQuery = parseInt(resolvedSearchParams.rating ?? "", 10);
  const rating = ratingOptions.includes(ratingQuery) ? ratingQuery : undefined;

  const getReviewsInput: Parameters<typeof getReviews>[0] = {
    page,
  };
  if (rating) {
    getReviewsInput.rating = rating;
  }
  if (search.trim()) {
    getReviewsInput.search = search;
  }

  const { reviews, total, totalPages, currentPage } =
    await getReviews(getReviewsInput);

  const t = await getTranslations("admin.reviews");
  const actions = await getTranslations("admin.common.actions");

  const formatDateWithTime = (value: Date | string) =>
    formatDateTime(value, locale);

  const basePath = getLocalizedPath("/admin/reviews", locale);

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  );
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;
  const paginationLinkClass =
    "border border-transparent bg-transparent text-foreground hover:bg-secondary hover:text-foreground";

  const searchQuery = search.trim();

  const buildPageLink = (targetPage: number) => {
    const params = new URLSearchParams();
    params.set("page", String(targetPage));
    if (searchQuery) params.set("search", searchQuery);
    if (rating) params.set("rating", String(rating));
    const query = params.toString();
    return `${basePath}${query ? `?${query}` : ""}`;
  };

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader title={t("title")} subtitle={t("subtitle")} />

      <Card>
        <CardContent className="p-4">
          <ReviewsFilters
            initialSearch={search}
            {...(rating ? { initialRating: rating } : {})}
            ratingOptions={ratingOptions.map((value) => ({
              value: String(value),
              label: t("filters.ratingOption", { rating: value }),
            }))}
            labels={{
              searchLabel: t("filters.searchLabel"),
              searchPlaceholder: t("filters.searchPlaceholder"),
              ratingLabel: t("filters.ratingLabel"),
              ratingAll: t("filters.ratingAll"),
              apply: t("filters.apply"),
              clear: t("filters.clear"),
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("table.client")}</TableHead>
                  <TableHead>{t("table.rating")}</TableHead>
                  <TableHead>{t("table.review")}</TableHead>
                  <TableHead>{t("table.created")}</TableHead>
                  <TableHead>{t("table.featured")}</TableHead>
                  <TableHead className="text-right">
                    {t("table.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-12 text-center text-muted-foreground"
                    >
                      {t("table.empty")}
                    </TableCell>
                  </TableRow>
                ) : (
                  reviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">
                            {review.clientName}
                          </p>
                          {review.clientEmail ? (
                            <p className="text-sm text-muted-foreground">
                              {review.clientEmail}
                            </p>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className="flex items-center gap-1"
                          aria-label={t("filters.ratingOption", {
                            rating: review.rating,
                          })}
                        >
                          {Array.from({ length: review.rating }).map(
                            (_, index) => (
                              <span key={index} className="text-accent">
                                ★
                              </span>
                            ),
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="line-clamp-3 text-sm text-muted-foreground">
                          {review.text}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateWithTime(review.createdAt)}
                      </TableCell>
                      <TableCell>
                        {review.featured ? (
                          <Badge variant="accent">{t("table.featured")}</Badge>
                        ) : (
                          <Text size="sm" muted>
                            —
                          </Text>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <ReviewActions
                          id={review.id}
                          featured={review.featured}
                          labels={{
                            deleteTitle: t("table.deleteTitle"),
                            deleteDescription: t("table.deleteDescription"),
                          }}
                          dialogLabels={{
                            cancel: actions("cancel"),
                            confirm: actions("delete"),
                            confirming: actions("deleting"),
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col gap-4 border-t border-border px-4 py-4 md:flex-row md:items-center md:justify-between">
              <Text size="sm" muted className="whitespace-nowrap">
                {t("pagination.showing", {
                  current: currentPage,
                  totalPages,
                  total,
                })}
              </Text>
              <Pagination className="w-auto justify-end">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href={`${basePath}?page=${Math.max(1, currentPage - 1)}${search ? `&search=${encodeURIComponent(search)}` : ""}${rating ? `&rating=${rating}` : ""}`}
                      aria-disabled={!canGoPrev}
                      className={cn(
                        paginationLinkClass,
                        !canGoPrev && "pointer-events-none opacity-50",
                      )}
                    />
                  </PaginationItem>
                  {pageNumbers.map((pageNumber) => (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        href={buildPageLink(pageNumber)}
                        isActive={pageNumber === currentPage}
                        className={paginationLinkClass}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href={`${basePath}?page=${Math.min(totalPages, currentPage + 1)}${search ? `&search=${encodeURIComponent(search)}` : ""}${rating ? `&rating=${rating}` : ""}`}
                      aria-disabled={!canGoNext}
                      className={cn(
                        paginationLinkClass,
                        !canGoNext && "pointer-events-none opacity-50",
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
