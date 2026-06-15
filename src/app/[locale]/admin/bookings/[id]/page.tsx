import type { ReactNode } from "react";

import { getTranslations } from "next-intl/server";
import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";

import type { AppointmentStatus } from "@prisma/client";
import { ArrowLeft } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  type BookingReferenceItem,
  BookingReferencesGallery,
} from "@/components/admin/bookings/BookingReferencesGallery";
import { BookingStatusControl } from "@/components/admin/bookings/BookingStatusControl";
import { Badge } from "@/components/styled/Badge";
import { Button } from "@/components/styled/Button";
import { Eyebrow, Text } from "@/components/styled/Typography";
import { Card, CardContent } from "@/components/ui/card";
import { type Locale, defaultLocale } from "@/i18n/config";
import { getLocalizedPath, isSupportedLocale } from "@/lib/locale-utils";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

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
  const detailT = await getTranslations("admin.bookings.detail");
  const statusesT = await getTranslations("admin.bookings.statuses");

  if (!id) {
    return notFoundResponse(locale, detailT);
  }

  const booking = await prisma.appointment.findUnique({ where: { id } });

  if (!booking) {
    return notFoundResponse(locale, detailT);
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
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title={detailT("title")}
        subtitle={detailT("subtitle")}
        actions={
          <Button
            href={getLocalizedPath("/admin/bookings", locale)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft />
            {detailT("back")}
          </Button>
        }
      />

      <Card className="border border-border shadow-lg">
        <CardContent className="space-y-6 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Eyebrow muted>{detailT("sectionEyebrow.status")}</Eyebrow>
            <Text size="xs" muted className="font-mono uppercase">
              {detailT("bookingCodeLabel", { code: booking.id })}
            </Text>
          </div>

          <div className="grid gap-6">
            <div className="border border-border/50 p-4 shadow-lg">
              <BookingStatusControl
                bookingId={booking.id}
                currentStatus={booking.status}
                statusOptions={statusOptions}
                labels={{
                  currentStatus: statusesT(booking.status),
                  button: detailT("statusControl.button"),
                }}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <InfoField label={detailT("submitted")} value={submittedFormat} />
              <InfoField label={detailT("updated")} value={updatedFormat} />
            </div>
          </div>
        </CardContent>
      </Card>

      <SectionCard eyebrow={detailT("sectionEyebrow.contact")}>
        <div className="grid gap-4 md:grid-cols-2">
          <InfoField label={detailT("fullName")} value={booking.fullName} />
          <InfoField
            label={detailT("email")}
            value={booking.email}
            valueHref={`mailto:${booking.email}`}
          />
          <InfoField
            label={detailT("contactMethod")}
            value={booking.contactMethod}
          />
          <InfoField
            label={detailT("phone")}
            value={booking.phone || detailT("notProvided")}
          />
        </div>
      </SectionCard>

      <SectionCard eyebrow={detailT("sectionEyebrow.tattoo")}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-4">
            <InfoField
              label={detailT("bodyPlacement")}
              value={booking.bodyPlacement || detailT("notProvided")}
            />
            <InfoField
              label={detailT("tattooSize")}
              value={booking.tattooSize || detailT("notProvided")}
            />
            <InfoField
              label={detailT("budget")}
              value={booking.budgetRange || detailT("noBudget")}
            />
          </div>
          <InfoField
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
        </div>
        <InfoField
          label={detailT("description")}
          value={booking.tattooDescription || detailT("notProvided")}
        />
      </SectionCard>

      <SectionCard eyebrow={detailT("sectionEyebrow.references")}>
        <div className="border border-dashed border-border bg-background p-4">
          <BookingReferencesGallery
            items={referenceGalleryItems}
            emptyLabel={detailT("noReferences")}
          />
        </div>
      </SectionCard>
    </div>
  );
}

function notFoundResponse(
  locale: Locale,
  detailT: Awaited<ReturnType<typeof getTranslations>>,
) {
  return (
    <div className="space-y-4">
      <Button
        href={getLocalizedPath("/admin/bookings", locale)}
        variant="outline"
        size="sm"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {detailT("back")}
      </Button>
      <Text muted>{detailT("notFound")}</Text>
    </div>
  );
}

interface SectionCardProps {
  eyebrow: string;
  children: ReactNode;
}

function SectionCard({ eyebrow, children }: SectionCardProps) {
  return (
    <Card className="border border-border shadow-lg">
      <CardContent className="space-y-6 p-6">
        <Eyebrow muted>{eyebrow}</Eyebrow>
        {children}
      </CardContent>
    </Card>
  );
}

interface InfoFieldProps {
  label: string;
  value: ReactNode;
  valueHref?: string;
}

function InfoField({ label, value, valueHref }: InfoFieldProps) {
  const valueClasses = "mt-3 text-base font-semibold leading-snug";

  return (
    <div className="border border-border/50 p-4 shadow-lg">
      <Text size="sm" muted>
        {label}
      </Text>
      {valueHref ? (
        <Link
          href={valueHref}
          className={cn(
            valueClasses,
            "inline-flex text-primary underline-offset-4 transition hover:underline",
          )}
        >
          {value}
        </Link>
      ) : (
        <div className={cn(valueClasses, "text-foreground")}>{value}</div>
      )}
    </div>
  );
}
