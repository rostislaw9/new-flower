import Link from "next/link";

import { Cog } from "lucide-react";

import { Eyebrow } from "@/components/styled/Typography";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface AdminSidebarHeaderProps {
  onClick: () => void;
}

export function AdminSidebarHeader({ onClick }: AdminSidebarHeaderProps) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild className="justify-start">
          <Link href="/admin" onClick={onClick}>
            <Cog size={20} className="text-accent" />
            <Eyebrow className="group-data-[collapsible=icon]:hidden">
              Console
            </Eyebrow>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
