"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";

import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Loader2, MoveLeft, Save } from "lucide-react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/styled/Button";
import { Heading, Text } from "@/components/styled/Typography";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { type Locale, defaultLocale } from "@/i18n/config";
import { getLocalizedPath, isSupportedLocale } from "@/lib/locale-utils";
import { type PortfolioItem } from "@/lib/portfolio-data";
import { cn } from "@/lib/utils";

interface SortableFeaturedCardProps {
  item: PortfolioItem;
  index: number;
}

const SortableFeaturedCard = memo(function SortableFeaturedCard({
  item,
  index,
}: SortableFeaturedCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    willChange: isDragging ? "transform" : undefined,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-lg transition-colors hover:border-accent",
        isDragging &&
          "z-10 border-accent/80 bg-background shadow-xl ring-2 ring-accent/40",
      )}
      {...attributes}
      {...listeners}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-muted/20">
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 45vw, 200px"
          className="h-full w-full object-cover"
        />
        <div className="absolute left-2 top-2 rounded-full border border-border/60 bg-background/80 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          {index + 1}
        </div>
      </div>
      <CardContent className="p-4">
        <Heading
          serif={false}
          size="sm"
          className="text-foreground transition-colors group-hover:text-accent"
        >
          {item.title}
        </Heading>
        <Text size="sm" muted className="capitalize">
          {item.category}
        </Text>
      </CardContent>
    </Card>
  );
});

export default function FeaturedOrderPage() {
  const rawLocale = useLocale();
  const locale: Locale = isSupportedLocale(rawLocale)
    ? rawLocale
    : defaultLocale;

  const t = useTranslations("admin.portfolio.reorder");
  const actionsT = useTranslations("admin.common.actions");
  const router = useRouter();

  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [initialOrder, setInitialOrder] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const backHref = getLocalizedPath("/admin/portfolio", locale);
  const sortableIds = useMemo(() => items.map((item) => item.id), [items]);

  const hasChanges = useMemo(() => {
    if (initialOrder.length !== items.length) {
      return true;
    }
    return initialOrder.some((id, index) => id !== items[index]?.id);
  }, [initialOrder, items]);

  const fetchFeaturedItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/portfolio", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to load portfolio");
      }
      const data = (await response.json()) as PortfolioItem[];
      const featuredOnly = data
        .filter((item) => item.featured)
        .sort((a, b) => a.displayOrder - b.displayOrder);
      setItems(featuredOnly);
      setInitialOrder(featuredOnly.map((item) => item.id));
    } catch (error) {
      console.error("[FeaturedOrderPage] load error", error);
      toast.error(t("error"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchFeaturedItems();
  }, [fetchFeaturedItems]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    setItems((prev) => {
      const oldIndex = prev.findIndex((item) => item.id === active.id);
      const newIndex = prev.findIndex((item) => item.id === over.id);
      if (oldIndex === -1 || newIndex === -1) {
        return prev;
      }
      return arrayMove(prev, oldIndex, newIndex);
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (items.length === 0 || isSaving || !hasChanges) {
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch("/api/portfolio/featured-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: items.map((item) => item.id) }),
      });

      const result = (await response.json()) as {
        success: boolean;
        message?: string;
      };
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save order");
      }

      setInitialOrder(items.map((item) => item.id));
      toast.success(t("success"));
      router.push(backHref);
    } catch (error) {
      console.error("[FeaturedOrderPage] save error", error);
      toast.error(t("error"));
    } finally {
      setIsSaving(false);
    }
  }, [hasChanges, isSaving, items, t, router, backHref]);

  const actions = (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        href={backHref}
        variant="outline"
        className="flex items-center gap-2"
      >
        <MoveLeft />
        {actionsT("back")}
      </Button>
      <Button
        size="sm"
        variant="accent"
        disabled={items.length === 0 || !hasChanges || isSaving}
        onClick={handleSave}
        className="flex items-center gap-2"
      >
        {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
        {isSaving ? t("saving") : t("save")}
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={t("title")}
        subtitle={t("description")}
        actions={actions}
      />

      {isLoading ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin" />
          <Text muted>{actionsT("loading")}</Text>
        </div>
      ) : items.length === 0 ? (
        <Empty className="rounded-2xl border">
          <EmptyHeader>
            <EmptyTitle>
              <Heading size="sm" serif={false}>
                {t("emptyTitle")}
              </Heading>
            </EmptyTitle>
          </EmptyHeader>
          <EmptyContent>
            <Text muted>{t("emptyDescription")}</Text>
          </EmptyContent>
        </Empty>
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
            <div className="overflow-x-auto pb-2">
              <div className="grid auto-cols-[minmax(200px,1fr)] grid-flow-col grid-rows-2 gap-4">
                {items.map((item, index) => (
                  <SortableFeaturedCard
                    key={item.id}
                    item={item}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
