import { getTranslations } from "next-intl/server";
import { unstable_noStore as noStore } from "next/cache";

import type { AppointmentStatus } from "@prisma/client";
import { CalendarOff, MoveLeft } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BookingInfoField } from "@/components/admin/bookings/BookingInfoField";
import {
  type BookingReferenceItem,
  BookingReferencesGallery,
} from "@/components/admin/bookings/BookingReferencesGallery";
import { BookingSectionCard } from "@/components/admin/bookings/BookingSectionCard";
import { BookingStatusControl } from "@/components/admin/bookings/BookingStatusControl";
import { Badge } from "@/components/styled/Badge";
import { Button } from "@/components/styled/Button";
import { Heading } from "@/components/styled/Typography";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { type Locale, defaultLocale } from "@/i18n/config";
import { getLocalizedPath, isSupportedLocale } from "@/lib/locale-utils";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

interface BookingDetailPageProps {
  params: Promise<{ locale?: string; id?: string }>;
}

export default async function BookingDetailPage({
  params,
}: BookingDetailPageProps) {
  const { locale: rawLocale, id } = await params;
  const locale: Locale = isSupportedLocale(rawLocale)
    ? rawLocale
    : defaultLocale;
  noStore();
  const actionsT = await getTranslations("admin.common.actions");
  const detailT = await getTranslations("admin.bookings.detail");
  const statusesT = await getTranslations("admin.bookings.statuses");

  const backHref = getLocalizedPath("/admin/bookings", locale);

  if (!id) {
    return notFoundResponse(backHref, detailT, actionsT);
  }

  const booking = await prisma.appointment.findUnique({ where: { id } });

  if (!booking) {
    return notFoundResponse(backHref, detailT, actionsT);
  }

  const submittedFormat = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(booking.createdAt);

  const updatedFormat = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(booking.updatedAt);

  const preferredDates = booking.preferredDates.map((date, index) => ({
    id: `${date}-${index}`,
    label: new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
    }).format(new Date(date)),
  }));

  const STATUS_VALUES: AppointmentStatus[] = [
    "pending",
    "contacted",
    "approved",
    "rejected",
    "completed",
  ];

  const statusOptions = STATUS_VALUES.map((value) => ({
    value,
    label: statusesT(value),
  }));

  const referenceGalleryItems: BookingReferenceItem[] =
    booking.referenceImages?.map((url, index) => ({
      id: `${booking.id}-ref-${index}`,
      title: detailT("referenceLinkLabel", { index: index + 1 }),
      description: booking.tattooDescription,
      imageUrl: url,
      width: 1200,
      height: 1600,
    })) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={detailT("title")}
        subtitle={detailT("subtitle")}
        actions={
          <Button
            size="sm"
            href={backHref}
            variant="outline"
            className="flex items-center gap-2"
          >
            <MoveLeft />
            {actionsT("back")}
          </Button>
        }
      />

      <BookingSectionCard
        eyebrow={detailT("sectionEyebrow.status")}
        hint={detailT("bookingCodeLabel", { code: booking.id })}
      >
        <div className="grid gap-4 md:grid-cols-4">
          <div className="col-span-2 content-center rounded-xl border border-border/60 bg-card/60 p-4 shadow-lg">
            <BookingStatusControl
              bookingId={booking.id}
              currentStatus={booking.status}
              statusOptions={statusOptions}
              labels={{
                currentStatus: statusesT(booking.status),
                button: detailT("statusControl.button"),
              }}
              messages={{
                success: detailT("statusControl.success"),
                error: detailT("statusControl.error"),
              }}
            />
          </div>
          <BookingInfoField
            label={detailT("submitted")}
            value={submittedFormat}
          />
          <BookingInfoField label={detailT("updated")} value={updatedFormat} />
        </div>
      </BookingSectionCard>

      <div className="grid gap-4 md:grid-cols-5">
        <BookingSectionCard
          eyebrow={detailT("sectionEyebrow.contact")}
          className="md:col-span-2"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <BookingInfoField
              label={detailT("fullName")}
              value={booking.fullName}
            />
            <BookingInfoField
              label={detailT("email")}
              value={booking.email}
              valueHref={`mailto:${booking.email}`}
            />
            <BookingInfoField
              label={detailT("contactMethod")}
              value={booking.contactMethod}
            />
            <BookingInfoField
              label={detailT("phone")}
              value={booking.phone || detailT("notProvided")}
            />
          </div>
          <BookingInfoField
            label={detailT("preferredDates")}
            value={
              preferredDates.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {preferredDates.map((date) => (
                    <Badge key={date.id}>{date.label}</Badge>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {detailT("noDates")}
                </span>
              )
            }
          />
        </BookingSectionCard>

        <BookingSectionCard
          eyebrow={detailT("sectionEyebrow.tattoo")}
          className="md:col-span-3"
        >
          <div className="grid gap-4 md:grid-cols-3">
            <BookingInfoField
              label={detailT("bodyPlacement")}
              value={booking.bodyPlacement || detailT("notProvided")}
            />
            <BookingInfoField
              label={detailT("tattooSize")}
              value={booking.tattooSize || detailT("notProvided")}
            />
            <BookingInfoField
              label={detailT("budget")}
              value={booking.budgetRange || detailT("noBudget")}
            />
          </div>
          <BookingInfoField
            label={detailT("description")}
            value={booking.tattooDescription || detailT("notProvided")}
          />
        </BookingSectionCard>
      </div>

      <BookingSectionCard eyebrow={detailT("sectionEyebrow.references")}>
        <div className="border border-dashed border-border bg-background p-4">
          <BookingReferencesGallery
            items={referenceGalleryItems}
            emptyLabel={detailT("noReferences")}
          />
        </div>
      </BookingSectionCard>
    </div>
  );
}

function notFoundResponse(
  backHref: string,
  detailT: Awaited<ReturnType<typeof getTranslations>>,
  actionsT: Awaited<ReturnType<typeof getTranslations>>,
) {
  return (
    <div className="space-y-4">
      <Button size="sm" variant="outline" href={backHref}>
        <MoveLeft />
        {actionsT("back")}
      </Button>
      <Empty className="rounded-xl border">
        <EmptyHeader>
          <EmptyMedia>
            <CalendarOff />
          </EmptyMedia>
          <EmptyTitle>
            <Heading size="sm" serif={false}>
              {detailT("notFound")}
            </Heading>
          </EmptyTitle>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
