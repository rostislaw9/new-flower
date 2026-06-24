import { getTranslations } from "next-intl/server";

import { Calendar, CheckCircle, Clock, Images } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ActionCard } from "@/components/admin/dashboard/ActionCard";
import { Eyebrow, Heading, Text } from "@/components/styled/Typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

async function getStats() {
  const [
    totalBookings,
    pendingBookings,
    completedBookings,
    totalPortfolioItems,
  ] = await Promise.all([
    prisma.appointment.count(),
    prisma.appointment.count({ where: { status: "pending" } }),
    prisma.appointment.count({ where: { status: "completed" } }),
    prisma.portfolioItem.count(),
  ]);

  return {
    totalBookings,
    pendingBookings,
    completedBookings,
    totalPortfolioItems,
  };
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  description: string;
}) => {
  return (
    <Card className="rounded-2xl border border-border/60 bg-card/60 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>
          <Eyebrow size="xs">{title}</Eyebrow>
        </CardTitle>
        <Icon size={16} className="text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <Heading serif={false} size="lg">
          {value}
        </Heading>
        <Text muted size="xs">
          {description}
        </Text>
      </CardContent>
    </Card>
  );
};

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
          icon={Calendar}
          description={t("stats.totalBookings.description")}
        />
        <StatCard
          title={t("stats.pending.title")}
          value={stats.pendingBookings}
          icon={Clock}
          description={t("stats.pending.description")}
        />
        <StatCard
          title={t("stats.completed.title")}
          value={stats.completedBookings}
          icon={CheckCircle}
          description={t("stats.completed.description")}
        />
        <StatCard
          title={t("stats.portfolio.title")}
          value={stats.totalPortfolioItems}
          icon={Images}
          description={t("stats.portfolio.description")}
        />
        <ActionCard
          title={t("actions.artistImages.title")}
          description={t("actions.artistImages.description")}
          href="/admin/artist-images"
          icon="user"
        />
        <ActionCard
          title={t("actions.portfolio.title")}
          description={t("actions.portfolio.description")}
          href="/admin/portfolio"
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
      </div>
    </div>
  );
}
