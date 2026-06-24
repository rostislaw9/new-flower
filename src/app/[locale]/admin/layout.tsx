"use client";

import * as React from "react";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTopLoader } from "nextjs-toploader";

import { Calendar, Cog, Images, LayoutDashboard, Star } from "lucide-react";

import { AdminNavMenu } from "@/components/admin/AdminNavMenu";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminSidebarFooterCTA } from "@/components/admin/AdminSidebarFooterCTA";
import { LanguageSwitcher } from "@/components/styled/LanguageSwitcher";
import { Eyebrow } from "@/components/styled/Typography";
import {
  Breadcrumb,
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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const SIDEBAR_STORAGE_KEY = "admin-sidebar-open";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [initialSidebarOpen, setInitialSidebarOpen] = React.useState<
    boolean | null
  >(null);
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("admin.layout");
  const { start } = useTopLoader();
  const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: t("nav.dashboard") },
    { href: "/admin/portfolio", icon: Images, label: t("nav.portfolio") },
    { href: "/admin/bookings", icon: Calendar, label: t("nav.bookings") },
    { href: "/admin/reviews", icon: Star, label: t("nav.reviews") },
  ];
  const breadcrumbItems = React.useMemo(
    () => buildAdminBreadcrumbs(pathname, locale),
    [locale, pathname],
  );

  React.useEffect(() => {
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
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="justify-start">
                <Link href="/admin" onClick={() => start()}>
                  <Cog size={20} className="text-accent" />
                  <Eyebrow className="group-data-[collapsible=icon]:hidden">
                    Console
                  </Eyebrow>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="px-2 py-4">
          <AdminNavMenu items={navItems} locale={locale} pathname={pathname} />
        </SidebarContent>
        <SidebarFooter className="px-2 py-4">
          <AdminSidebarFooterCTA href={`/${locale}`} label={t("openWebsite")} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b border-border/70 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-4" />
            <AdminBreadcrumbsTrail items={breadcrumbItems} />
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

  React.useEffect(() => {
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

function AdminBreadcrumbsTrail({ items }: { items: AdminBreadcrumb[] }) {
  if (!items.length) {
    return null;
  }

  return (
    <Breadcrumb className="hidden min-w-0 flex-1 items-center gap-1 text-sm md:flex">
      <BreadcrumbList className="flex-nowrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={`${item.label}-${item.href ?? index}`}>
              <BreadcrumbItem className="max-w-[180px] flex-shrink">
                {isLast || !item.href ? (
                  <BreadcrumbPage className="truncate font-medium">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild className="truncate">
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast ? <BreadcrumbSeparator /> : null}
            </React.Fragment>
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
