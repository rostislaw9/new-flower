"use client";

import Link from "next/link";

import { ExternalLink } from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface AdminSidebarFooterCTAProps {
  href: string;
  label: string;
}

export function AdminSidebarFooterCTA({
  href,
  label,
}: AdminSidebarFooterCTAProps) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip={label} className="justify-start">
          <Link href={href} target="_blank" className="flex items-center gap-2">
            <ExternalLink />
            <span className="group-data-[collapsible=icon]:hidden">
              {label}
            </span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
