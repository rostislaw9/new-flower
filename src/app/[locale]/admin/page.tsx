import { getTranslations } from "next-intl/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ActionCard } from "@/components/admin/dashboard/ActionCard";
import { StatCard } from "@/components/admin/dashboard/StatCard";
import { prisma } from "@/lib/prisma";

async function getStats() {
  const [totalBookings, pendingBookings, completedBookings, totalGalleryItems] =
    await Promise.all([
      prisma.appointment.count(),
      prisma.appointment.count({ where: { status: "pending" } }),
      prisma.appointment.count({ where: { status: "completed" } }),
      prisma.galleryItem.count(),
    ]);

  return {
    totalBookings,
    pendingBookings,
    completedBookings,
    totalGalleryItems,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();
  const t = await getTranslations("admin.dashboard");

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t("stats.totalBookings.title")}
          value={stats.totalBookings}
          icon="calendar"
          description={t("stats.totalBookings.description")}
          href="/admin/bookings"
        />
        <StatCard
          title={t("stats.pending.title")}
          value={stats.pendingBookings}
          icon="clock"
          description={t("stats.pending.description")}
          href="/admin/bookings?status=pending"
        />
        <StatCard
          title={t("stats.completed.title")}
          value={stats.completedBookings}
          icon="checkCircle"
          description={t("stats.completed.description")}
          href="/admin/bookings?status=completed"
        />
        <StatCard
          title={t("stats.gallery.title")}
          value={stats.totalGalleryItems}
          icon="images"
          description={t("stats.gallery.description")}
          href="/admin/gallery"
        />
        <ActionCard
          title={t("actions.artistImages.title")}
          description={t("actions.artistImages.description")}
          href="/admin/artist-images"
          icon="user"
        />
        <ActionCard
          title={t("actions.gallery.title")}
          description={t("actions.gallery.description")}
          href="/admin/gallery"
          icon="images"
        />
        <ActionCard
          title={t("actions.bookings.title")}
          description={t("actions.bookings.description")}
          href="/admin/bookings"
          icon="calendar"
        />
        <ActionCard
          title={t("actions.reviews.title")}
          description={t("actions.reviews.description")}
          href="/admin/reviews"
          icon="star"
        />
        <ActionCard
          title={t("actions.faq.title")}
          description={t("actions.faq.description")}
          href="/admin/faq"
          icon="helpcircle"
        />
      </div>
    </div>
  );
}
