import { getTranslations } from "next-intl/server";
import { unstable_noStore as noStore } from "next/cache";

import type { AppointmentStatus, Prisma } from "@prisma/client";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BookingsFilters } from "@/components/admin/bookings/BookingsFilters";
import { BookingsTableRow } from "@/components/admin/bookings/BookingsTableRow";
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
import { formatDate, formatDateTime } from "@/lib/date-utils";
import { getLocalizedPath, isSupportedLocale } from "@/lib/locale-utils";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const revalidate = 0;

const ITEMS_PER_PAGE = 10;

interface BookingsPageProps {
  params: Promise<{ locale?: string }>;
  searchParams: Promise<{
    page?: string;
    status?: AppointmentStatus | "all";
    search?: string;
    bookingId?: string;
    submittedFrom?: string;
    submittedTo?: string;
    updatedFrom?: string;
    updatedTo?: string;
    preferredFrom?: string;
    preferredTo?: string;
  }>;
}

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

async function getBookings(filters: {
  page: number;
  status: AppointmentStatus | "all";
  search: string;
  bookingId?: string;
  submittedFrom?: string;
  submittedTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
  preferredFrom?: string;
  preferredTo?: string;
}) {
  noStore();
  const where: Prisma.AppointmentWhereInput = {};

  if (filters.status !== "all") {
    where.status = filters.status;
  }

  if (filters.bookingId?.trim()) {
    where.id = {
      contains: filters.bookingId.trim(),
      mode: "insensitive",
    };
  }

  if (filters.search) {
    where.OR = [
      {
        fullName: { contains: filters.search, mode: "insensitive" },
      },
      { email: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const submittedStart = toDate(filters.submittedFrom);
  const submittedEnd = toDate(filters.submittedTo, true);
  if (submittedStart || submittedEnd) {
    where.createdAt = {};
    if (submittedStart) {
      where.createdAt.gte = submittedStart;
    }
    if (submittedEnd) {
      where.createdAt.lte = submittedEnd;
    }
  }

  const updatedStart = toDate(filters.updatedFrom);
  const updatedEnd = toDate(filters.updatedTo, true);
  if (updatedStart || updatedEnd) {
    where.updatedAt = {};
    if (updatedStart) {
      where.updatedAt.gte = updatedStart;
    }
    if (updatedEnd) {
      where.updatedAt.lte = updatedEnd;
    }
  }

  const baseBookings = await prisma.appointment.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const preferredStart = toDate(filters.preferredFrom);
  const preferredEnd = toDate(filters.preferredTo, true);

  const filteredBookings =
    preferredStart || preferredEnd
      ? baseBookings.filter((booking) => {
          if (!booking.preferredDates.length) {
            return false;
          }
          return booking.preferredDates.some((raw) => {
            const date = new Date(raw);
            if (Number.isNaN(date.getTime())) {
              return false;
            }
            if (preferredStart && date < preferredStart) {
              return false;
            }
            if (preferredEnd && date > preferredEnd) {
              return false;
            }
            return true;
          });
        })
      : baseBookings;

  const total = filteredBookings.length;
  const totalPages = total === 0 ? 1 : Math.ceil(total / ITEMS_PER_PAGE);
  const safePage = Math.min(filters.page, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const bookings = filteredBookings.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  return { bookings, total, totalPages, currentPage: safePage };
}

export default async function BookingsAdminPage({
  params,
  searchParams,
}: BookingsPageProps) {
  noStore();
  const { locale: rawLocale } = await params;
  const locale: Locale = isSupportedLocale(rawLocale)
    ? rawLocale
    : defaultLocale;
  const resolvedSearchParams = await searchParams;
  const page = Math.max(1, parseInt(resolvedSearchParams.page || "1"));
  const status =
    (resolvedSearchParams.status as AppointmentStatus | "all") || "all";
  const search = resolvedSearchParams.search || "";
  const bookingId = resolvedSearchParams.bookingId || "";
  const submittedFrom = resolvedSearchParams.submittedFrom || "";
  const submittedTo = resolvedSearchParams.submittedTo || "";
  const updatedFrom = resolvedSearchParams.updatedFrom || "";
  const updatedTo = resolvedSearchParams.updatedTo || "";
  const preferredFrom = resolvedSearchParams.preferredFrom || "";
  const preferredTo = resolvedSearchParams.preferredTo || "";

  const filtersInput: Parameters<typeof getBookings>[0] = {
    page,
    status,
    search,
  };

  if (bookingId.trim()) {
    filtersInput.bookingId = bookingId.trim();
  }
  if (submittedFrom) {
    filtersInput.submittedFrom = submittedFrom;
  }
  if (submittedTo) {
    filtersInput.submittedTo = submittedTo;
  }
  if (updatedFrom) {
    filtersInput.updatedFrom = updatedFrom;
  }
  if (updatedTo) {
    filtersInput.updatedTo = updatedTo;
  }
  if (preferredFrom) {
    filtersInput.preferredFrom = preferredFrom;
  }
  if (preferredTo) {
    filtersInput.preferredTo = preferredTo;
  }

  const {
    bookings,
    total,
    totalPages,
    currentPage: resolvedPage,
  } = await getBookings(filtersInput);

  const t = await getTranslations("admin.bookings");
  const actionsT = await getTranslations("admin.common.actions");
  const formatDateOnly = (value: Date | string) => formatDate(value, locale);
  const formatDateWithTime = (value: Date | string) =>
    formatDateTime(value, locale);
  const activePage = resolvedPage;
  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  );
  const canGoPrev = activePage > 1;
  const canGoNext = activePage < totalPages;
  const paginationLinkClass =
    "border border-transparent bg-transparent text-foreground hover:bg-secondary hover:text-foreground";

  const STATUS_OPTIONS: { value: AppointmentStatus | "all"; label: string }[] =
    [
      { value: "all", label: t("filters.statusOptions.all") },
      { value: "pending", label: t("filters.statusOptions.pending") },
      { value: "contacted", label: t("filters.statusOptions.contacted") },
      { value: "approved", label: t("filters.statusOptions.approved") },
      { value: "rejected", label: t("filters.statusOptions.rejected") },
      { value: "completed", label: t("filters.statusOptions.completed") },
    ];

  const baseParams = new URLSearchParams();
  baseParams.set("page", "1");
  if (status !== "all") baseParams.set("status", status);
  if (search) baseParams.set("search", search);
  if (bookingId) baseParams.set("bookingId", bookingId);
  if (submittedFrom) baseParams.set("submittedFrom", submittedFrom);
  if (submittedTo) baseParams.set("submittedTo", submittedTo);
  if (updatedFrom) baseParams.set("updatedFrom", updatedFrom);
  if (updatedTo) baseParams.set("updatedTo", updatedTo);
  if (preferredFrom) baseParams.set("preferredFrom", preferredFrom);
  if (preferredTo) baseParams.set("preferredTo", preferredTo);

  function buildQueryString(updates: Record<string, string | undefined>) {
    const paramsCopy = new URLSearchParams(baseParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        paramsCopy.delete(key);
      } else {
        paramsCopy.set(key, value);
      }
    });
    const query = paramsCopy.toString();
    return query ? `?${query}` : "";
  }

  const basePath = getLocalizedPath("/admin/bookings", locale);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title={t("title")} subtitle={t("subtitle")} />

      {/* Filters */}
      <Card className="rounded-2xl border border-border/60 bg-card/60 shadow-lg">
        <CardContent className="pt-6">
          <BookingsFilters
            initialValues={{
              search: search ?? "",
              status: status ?? "all",
              bookingId,
              submittedFrom: submittedFrom ?? "",
              submittedTo: submittedTo ?? "",
              updatedFrom: updatedFrom ?? "",
              updatedTo: updatedTo ?? "",
              preferredFrom: preferredFrom ?? "",
              preferredTo: preferredTo ?? "",
            }}
            statusOptions={STATUS_OPTIONS}
            labels={{
              searchLabel: t("filters.searchLabel"),
              searchPlaceholder: t("filters.searchPlaceholder"),
              statusLabel: t("filters.statusLabel"),
              bookingIdLabel: t("filters.bookingIdLabel"),
              bookingIdPlaceholder: t("filters.bookingIdPlaceholder"),
              submittedRangeLabel: t("filters.submittedRangeLabel"),
              updatedRangeLabel: t("filters.updatedRangeLabel"),
              preferredRangeLabel: t("filters.preferredRangeLabel"),
              dateFrom: t("filters.dateFrom"),
              dateTo: t("filters.dateTo"),
              dateClearLabel: t("filters.dateClearLabel"),
              filter: t("filters.filter"),
              clear: t("filters.clear"),
            }}
            locale={locale}
          />
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card className="rounded-2xl border border-border/60 bg-card/60 shadow-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("table.client")}</TableHead>
                  <TableHead>{t("table.status")}</TableHead>
                  <TableHead>{t("table.dates")}</TableHead>
                  <TableHead>{t("table.submitted")}</TableHead>
                  <TableHead>{t("table.updated")}</TableHead>
                  <TableHead className="text-right">
                    {t("table.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-12 text-center text-muted-foreground"
                    >
                      {t("table.empty")}
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((booking) => {
                    const detailHref = getLocalizedPath(
                      `/admin/bookings/${booking.id}`,
                      locale,
                    );
                    const preferredPreview = booking.preferredDates.slice(0, 2);
                    const preferredPreviewFormatted = preferredPreview.map(
                      (date) => formatDateOnly(date),
                    );
                    const remainingPreferredDates =
                      booking.preferredDates.length - preferredPreview.length;
                    const moreDatesLabel =
                      remainingPreferredDates > 0
                        ? t("table.moreDates", {
                            count: remainingPreferredDates,
                          })
                        : undefined;

                    return (
                      <BookingsTableRow
                        key={booking.id}
                        bookingId={booking.id}
                        detailHref={detailHref}
                        clientName={booking.fullName}
                        clientEmail={booking.email}
                        status={booking.status}
                        statusLabel={t(`statuses.${booking.status}`)}
                        preferredDates={preferredPreviewFormatted}
                        noDatesLabel={t("detail.noDates")}
                        remainingPreferredDates={remainingPreferredDates}
                        submittedLabel={formatDateWithTime(booking.createdAt)}
                        updatedLabel={formatDateWithTime(booking.updatedAt)}
                        viewLabel={t("table.view")}
                        deleteLabels={{
                          title: t("table.deleteTitle"),
                          description: t("table.deleteDescription"),
                          confirm: actionsT("delete"),
                          confirming: actionsT("deleting"),
                          cancel: actionsT("cancel"),
                        }}
                        messages={{
                          deleteSuccess: t("messages.deleteSuccess"),
                          deleteError: t("messages.deleteError"),
                        }}
                        {...(moreDatesLabel ? { moreDatesLabel } : {})}
                      />
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center gap-4 border-t border-border px-4 py-4 md:flex-row md:justify-between">
              <Text size="sm" muted className="whitespace-nowrap">
                {t("pagination.showing", {
                  current: activePage,
                  totalPages,
                  total,
                })}
              </Text>
              <Pagination className="md:justify-end">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href={`${basePath}${buildQueryString({
                        page: String(Math.max(1, activePage - 1)),
                      })}`}
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
                        href={`${basePath}${buildQueryString({
                          page: String(pageNumber),
                        })}`}
                        isActive={pageNumber === activePage}
                        className={paginationLinkClass}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href={`${basePath}${buildQueryString({
                        page: String(Math.min(totalPages, activePage + 1)),
                      })}`}
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
