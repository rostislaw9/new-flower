"use client";

import { type ReactNode, createContext, useContext, useState } from "react";

import { Filter } from "lucide-react";

import { Button } from "@/components/styled/Button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

const DrawerCloseContext = createContext<(() => void) | null>(null);

export function useDrawerClose() {
  return useContext(DrawerCloseContext);
}

interface AdminFiltersShellProps {
  title: string;
  description?: string;
  drawerTriggerLabel: string;
  collapseOpenLabel: string;
  collapseClosedLabel: string;
  children: ReactNode;
}

export function AdminFiltersShell({
  title,
  description,
  drawerTriggerLabel,
  collapseOpenLabel,
  collapseClosedLabel,
  children,
}: AdminFiltersShellProps) {
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);

  const closeDrawer = () => setDrawerOpen(false);

  if (isMobile) {
    return (
      <DrawerCloseContext.Provider value={closeDrawer}>
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="flex w-full items-center justify-between rounded-2xl border border-border/60 bg-card/60 text-sm text-accent"
            >
              {drawerTriggerLabel}
              <Filter />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[90vh] rounded-t-3xl border-border/60 bg-background">
            <DrawerHeader className="text-left">
              <DrawerTitle>{title}</DrawerTitle>
              {description ? (
                <DrawerDescription>{description}</DrawerDescription>
              ) : null}
            </DrawerHeader>
            <ScrollArea className="flex-1">
              <div className="px-4 pb-6">{children}</div>
            </ScrollArea>
          </DrawerContent>
        </Drawer>
      </DrawerCloseContext.Provider>
    );
  }

  return (
    <Card className="rounded-2xl border border-border/60 bg-card/60 shadow-lg">
      <Collapsible open={desktopOpen} onOpenChange={setDesktopOpen}>
        <div className="flex items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">
              {title}
            </p>
            {description ? (
              <p className="text-sm text-muted-foreground/80">{description}</p>
            ) : null}
          </div>
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground"
            >
              {desktopOpen ? collapseOpenLabel : collapseClosedLabel}
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <CardContent className="border-t border-border/60 pt-6">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
