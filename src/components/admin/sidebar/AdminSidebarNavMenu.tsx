"use client";

import * as React from "react";

import Link from "next/link";
import { useTopLoader } from "nextjs-toploader";

import type { LucideIcon } from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export type AdminNavItem = {
  href: string;
  icon: LucideIcon;
  label: string;
};

interface AdminNavMenuProps {
  items: AdminNavItem[];
  locale: string;
  pathname: string;
}

export function AdminSidebarNavMenu({
  items,
  locale,
  pathname,
}: AdminNavMenuProps) {
  const { isMobile, setOpenMobile } = useSidebar();
  const { start } = useTopLoader();

  const handleNavigate = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [isMobile, setOpenMobile]);

  return (
    <SidebarMenu className="space-y-1">
      {items.map((item) => {
        const isActive =
          pathname === `/${locale}${item.href}` || pathname === item.href;
        const Icon = item.icon;

        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              onClick={() => {
                start();
                handleNavigate();
              }}
              tooltip={item.label}
              className="justify-start text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground active:bg-accent active:text-accent-foreground data-[active=true]:text-accent group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
            >
              <Link
                href={item.href}
                onClick={() => {
                  start();
                  handleNavigate();
                }}
              >
                <Icon />
                <span className="group-data-[collapsible=icon]:hidden">
                  {item.label}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
