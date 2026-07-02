"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";

import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";

import type { DragEndEvent } from "@dnd-kit/core";
import {
  DndContext,
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
import { Loader2, MoveLeft, RotateCcwSquare, Save } from "lucide-react";
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
import { type GalleryItem } from "@/lib/gallery-data";
import { getLocalizedPath, isSupportedLocale } from "@/lib/locale-utils";
import { cn } from "@/lib/utils";

interface SortableFeaturedCardProps {
  item: GalleryItem;
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
      <div className="relative aspect-[4/2] overflow-hidden bg-muted/20 md:aspect-[3/4]">
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 20vw, 200px"
          className="h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute left-1.5 top-1.5 rounded-full border border-border/60 bg-background/80 px-1.5 py-0.5 text-2xs font-semibold text-muted-foreground max-md:landscape:text-2xs">
          {index + 1}
        </div>
      </div>
      <CardContent className="p-3 max-md:landscape:p-2">
        <Heading
          serif={false}
          size="sm"
          className="text-foreground transition-colors group-hover:text-accent max-md:landscape:text-xs max-md:landscape:leading-tight"
        >
          {item.title}
        </Heading>
        <Text
          size="sm"
          muted
          className="capitalize max-md:landscape:text-2xs max-md:landscape:leading-tight"
        >
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

  const t = useTranslations("admin.gallery.reorder");
  const actionsT = useTranslations("admin.common.actions");
  const router = useRouter();

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [initialOrder, setInitialOrder] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  );

  const backHref = getLocalizedPath("/admin/gallery", locale);
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
      const response = await fetch("/api/gallery", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to load gallery");
      }
      const data = (await response.json()) as GalleryItem[];
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

  const preventScroll = useCallback((e: TouchEvent) => {
    e.preventDefault();
  }, []);

  const handleDragStart = useCallback(() => {
    document.addEventListener("touchmove", preventScroll, {
      passive: false,
    });
  }, [preventScroll]);

  const handleDragStop = useCallback(() => {
    document.removeEventListener("touchmove", preventScroll);
  }, [preventScroll]);

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
      const response = await fetch("/api/gallery/featured-order", {
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

      {/* Landscape hint for mobile */}
      <div className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/30 px-3 py-2 md:hidden landscape:hidden">
        <RotateCcwSquare className="text-muted-foreground" />
        <Text muted size="sm">
          {t("landscapeHint")}
        </Text>
      </div>

      {isLoading ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin" />
          <Text muted>{actionsT("loading")}</Text>
        </div>
      ) : items.length === 0 ? (
        <Empty className="rounded-xl border">
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
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragCancel={handleDragStop}
          onDragEnd={(event) => {
            handleDragStop();
            handleDragEnd(event);
          }}
        >
          <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
            <div className="hidden overflow-x-auto pb-2 md:block landscape:block">
              <div className="grid grid-flow-col grid-cols-5 grid-rows-2 gap-4 max-md:landscape:gap-2">
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
