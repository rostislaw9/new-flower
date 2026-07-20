import { useCallback } from "react";

import Link from "next/link";
import { useTopLoader } from "nextjs-toploader";

import { Cog } from "lucide-react";

import { Eyebrow } from "@/components/styled/Typography";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function AdminSidebarHeader() {
  const { isMobile, setOpenMobile } = useSidebar();
  const { start } = useTopLoader();

  const handleNavigate = useCallback(() => {
    start();
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [start, isMobile, setOpenMobile]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild className="justify-start">
          <Link href="/admin" onClick={handleNavigate}>
            <Cog size={20} className="text-accent" />
            <Eyebrow className="text-nowrap group-data-[collapsible=icon]:hidden">
              Admin Console
            </Eyebrow>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
