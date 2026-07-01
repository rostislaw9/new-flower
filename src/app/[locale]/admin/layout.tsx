"use client";

import type { ReactNode } from "react";
import { Fragment, useEffect, useMemo, useState } from "react";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Calendar,
  HelpCircle,
  Images,
  LayoutDashboard,
  Star,
  User,
} from "lucide-react";

import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminSidebarFooter } from "@/components/admin/sidebar/AdminSidebarFooter";
import { AdminSidebarHeader } from "@/components/admin/sidebar/AdminSidebarHeader";
import { AdminSidebarNavMenu } from "@/components/admin/sidebar/AdminSidebarNavMenu";
import { LanguageSwitcher } from "@/components/styled/LanguageSwitcher";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { type Locale, defaultLocale } from "@/i18n/config";
import { isSupportedLocale } from "@/lib/locale-utils";

const SIDEBAR_STORAGE_KEY = "admin-sidebar-open";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const rawLocale = useLocale();
  const locale: Locale = isSupportedLocale(rawLocale)
    ? rawLocale
    : defaultLocale;

  const pathname = usePathname();
  const t = useTranslations("admin.layout");
  const isMobile = useIsMobile();

  const [initialSidebarOpen, setInitialSidebarOpen] = useState<boolean | null>(
    null,
  );

  const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: t("nav.dashboard") },
    { href: "/admin/artist-images", icon: User, label: t("nav.artistImages") },
    { href: "/admin/portfolio", icon: Images, label: t("nav.portfolio") },
    { href: "/admin/bookings", icon: Calendar, label: t("nav.bookings") },
    { href: "/admin/reviews", icon: Star, label: t("nav.reviews") },
    { href: "/admin/faq", icon: HelpCircle, label: t("nav.faq") },
  ];

  const breadcrumbItems = useMemo(
    () => buildAdminBreadcrumbs(pathname, locale),
    [locale, pathname],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored === "true" || stored === "false") {
      setInitialSidebarOpen(stored === "true");
      return;
    }

    setInitialSidebarOpen(true);
  }, []);

  if (initialSidebarOpen === null) {
    return null;
  }

  return (
    <SidebarProvider defaultOpen={initialSidebarOpen}>
      <SidebarStatePersistence />
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <SidebarHeader className="py-4">
          <AdminSidebarHeader />
        </SidebarHeader>
        <SidebarContent className="px-2 py-4">
          <AdminSidebarNavMenu
            items={navItems}
            locale={locale}
            pathname={pathname}
          />
        </SidebarContent>
        <SidebarFooter className="px-2 py-4">
          <AdminSidebarFooter href={`/${locale}`} label={t("openWebsite")} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/90 px-4 backdrop-blur-sm">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-4" />
            <AdminBreadcrumbsTrail
              items={breadcrumbItems}
              isMobile={isMobile}
            />
          </div>
          <div className="ml-auto">
            <LanguageSwitcher linkClassName="text-xs" />
          </div>
        </header>
        <AdminPageShell>{children}</AdminPageShell>
      </SidebarInset>
    </SidebarProvider>
  );
}

function SidebarStatePersistence() {
  const { state } = useSidebar();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      SIDEBAR_STORAGE_KEY,
      state === "expanded" ? "true" : "false",
    );
  }, [state]);

  return null;
}

type AdminBreadcrumb = {
  label: string;
  href?: string;
};

function AdminBreadcrumbsTrail({
  items,
  isMobile,
}: {
  items: AdminBreadcrumb[];
  isMobile: boolean;
}) {
  if (!items.length) {
    return null;
  }

  const shouldCollapse = isMobile && items.length > 2;
  const displayItems: (AdminBreadcrumb | { label: string })[] = shouldCollapse
    ? [items[0]!, { label: "..." }, items[items.length - 1]!]
    : items;

  return (
    <Breadcrumb className="min-w-0 flex-1 items-center gap-1 text-sm">
      <BreadcrumbList className="flex-nowrap">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isEllipsis = item.label === "...";
          const itemWithHref = item as AdminBreadcrumb;

          return (
            <Fragment key={`${item.label}-${itemWithHref.href ?? index}`}>
              <BreadcrumbItem className="max-w-[180px] flex-shrink md:max-w-none">
                {isEllipsis ? (
                  <BreadcrumbEllipsis />
                ) : isLast || !itemWithHref.href ? (
                  <BreadcrumbPage className="truncate font-medium">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild className="truncate">
                    <Link href={itemWithHref.href}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast ? <BreadcrumbSeparator /> : null}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function buildAdminBreadcrumbs(
  pathname: string,
  locale: string,
): AdminBreadcrumb[] {
  const labelMap: Record<string, string> = {
    admin: "Dashboard",
    bookings: "Bookings",
    portfolio: "Portfolio",
    reviews: "Reviews",
    faq: "FAQ",
    new: "New",
    edit: "Edit",
  };

  const segments = pathname.split("/").filter(Boolean);
  let currentPath = "";
  const crumbs: AdminBreadcrumb[] = [];

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    if (index === 0 && segment === locale) {
      return;
    }

    const isLast = index === segments.length - 1;
    const label = labelMap[segment] ?? formatSegment(segment);
    const crumb: AdminBreadcrumb = { label };
    if (!isLast) {
      crumb.href = currentPath;
    }
    crumbs.push(crumb);
  });

  if (!crumbs.length) {
    crumbs.push({ label: "Dashboard" });
  }

  return crumbs;
}

function formatSegment(segment: string) {
  if (/^\d+$/.test(segment)) {
    return `#${segment}`;
  }

  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
