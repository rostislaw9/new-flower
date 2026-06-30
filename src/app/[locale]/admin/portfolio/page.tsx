"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTopLoader } from "nextjs-toploader";

import {
  CheckSquare2,
  Flag,
  FlagOff,
  ImageOff,
  Loader2,
  MoveLeft,
  Square,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Badge } from "@/components/styled/Badge";
import { Button } from "@/components/styled/Button";
import { DeleteConfirmDialog } from "@/components/styled/DeleteConfirmDialog";
import { Heading, Text } from "@/components/styled/Typography";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { type Locale, defaultLocale } from "@/i18n/config";
import {
  deletePortfolioItem,
  setPortfolioItemFeatured,
} from "@/lib/actions/portfolio";
import { getLocalizedPath, isSupportedLocale } from "@/lib/locale-utils";
import { MAX_FEATURED_ITEMS, type PortfolioItem } from "@/lib/portfolio-data";

const INITIAL_BATCH = 15;
const LOAD_MORE_BATCH = 10;

export default function PortfolioAdminPage() {
  const rawLocale = useLocale();
  const locale: Locale = isSupportedLocale(rawLocale)
    ? rawLocale
    : defaultLocale;

  const router = useRouter();
  const { start } = useTopLoader();
  const t = useTranslations("admin.portfolio");
  const actionsT = useTranslations("admin.common.actions");

  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [bulkFlagLoading, setBulkFlagLoading] = useState<
    "feature" | "unfeature" | null
  >(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const backHref = useMemo(() => getLocalizedPath("/admin", locale), [locale]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch("/api/portfolio");
        const data = (await response.json()) as PortfolioItem[];
        setItems(data);
        setVisibleCount(Math.min(data.length, INITIAL_BATCH));
      } catch {
        console.error("Failed to fetch portfolio items");
      } finally {
        setLoading(false);
      }
    };
    void fetchItems();
  }, []);

  useEffect(() => {
    setVisibleCount((prev) => {
      if (items.length === 0) {
        return INITIAL_BATCH;
      }
      return Math.min(Math.max(prev, INITIAL_BATCH), items.length);
    });
  }, [items.length]);

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel) return;
    if (visibleCount >= items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry) {
          return;
        }
        if (entry.isIntersecting) {
          setVisibleCount((prev) =>
            Math.min(items.length, prev + LOAD_MORE_BATCH),
          );
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [items.length, visibleCount]);

  const visibleItems = items.slice(0, visibleCount);

  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.has(item.id)),
    [items, selectedIds],
  );

  const featuredItemsCount = useMemo(
    () => items.filter((item) => item.featured).length,
    [items],
  );

  const selectedFeaturedCount = selectedItems.filter(
    (item) => item.featured,
  ).length;
  const selectedNonFeaturedCount = selectedItems.length - selectedFeaturedCount;
  const availableFeaturedSlots = Math.max(
    0,
    MAX_FEATURED_ITEMS - featuredItemsCount,
  );

  const canFlagFeatured =
    selectedNonFeaturedCount > 0 &&
    selectedFeaturedCount === 0 &&
    selectedNonFeaturedCount <= availableFeaturedSlots;

  const canFlagNotFeatured = selectedFeaturedCount > 0;

  const refreshItems = async () => {
    const response = await fetch("/api/portfolio");
    const data = (await response.json()) as PortfolioItem[];
    setItems(data);
  };

  async function handleBulkFeatureUpdate(featured: boolean) {
    if (selectedIds.size === 0) {
      return;
    }

    if (featured && !canFlagFeatured) {
      toast.error(
        t("bulk.noSlots", {
          count: availableFeaturedSlots,
        }),
      );
      return;
    }

    setBulkFlagLoading(featured ? "feature" : "unfeature");
    try {
      for (const id of selectedIds) {
        const result = await setPortfolioItemFeatured(id, featured);
        if (!result.success) {
          throw new Error(result.message ?? "Failed to update");
        }
      }

      await refreshItems();
      toast.success(
        featured ? t("alerts.markedFeatured") : t("alerts.removedFeatured"),
      );
    } catch (error) {
      console.error("[handleBulkFeatureUpdate] Error:", error);
      toast.error(t("alerts.toggleFeaturedFailed"));
    } finally {
      setBulkFlagLoading(null);
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return;

    const idsToDelete = Array.from(selectedIds);
    let successCount = 0;

    for (const id of idsToDelete) {
      const result = await deletePortfolioItem(id);
      if (result.success) {
        successCount++;
      }
    }

    setItems((prev) => prev.filter((i) => !selectedIds.has(i.id)));
    setSelectedIds(new Set());
    setConfirmBulkDelete(false);

    if (successCount === idsToDelete.length) {
      toast.success(t("alerts.bulkDeleteSuccess", { count: successCount }));
    } else {
      toast.error(
        t("alerts.bulkDeletePartialFail", {
          success: successCount,
          total: idsToDelete.length,
        }),
      );
    }
  }

  const toggleSelectId = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === visibleItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(visibleItems.map((item) => item.id)));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin" />
        <Text muted>{actionsT("loading")}</Text>
      </div>
    );
  }

  const hasItems = items.length > 0;

  const editHref = (id: string) =>
    getLocalizedPath(`/admin/portfolio/${id}/edit`, locale);
  const uploadHref = getLocalizedPath("/admin/portfolio/upload", locale);

  const emptyState = (
    <Empty className="rounded-xl border">
      <EmptyHeader>
        <EmptyMedia>
          <ImageOff />
        </EmptyMedia>
        <EmptyTitle>
          <Heading size="sm" serif={false}>
            {t("noItems")}
          </Heading>
        </EmptyTitle>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="accent" href={uploadHref}>
          <Upload />
          {t("publishWork")}
        </Button>
      </EmptyContent>
    </Empty>
  );

  const bulkActions = (
    <div className="flex flex-row flex-wrap justify-between gap-2 border-b border-border/70 bg-background/70 p-2 shadow-sm backdrop-blur-sm">
      {selectedIds.size > 0 && (
        <Button
          size="sm"
          variant="outline"
          onClick={toggleSelectAll}
          className="bg-background/70"
        >
          {selectedIds.size === visibleItems.length
            ? t("bulk.deselectAll")
            : t("bulk.selectAll")}
        </Button>
      )}
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap gap-2">
          {canFlagFeatured && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkFeatureUpdate(true)}
              disabled={bulkFlagLoading !== null}
              className="bg-background/70"
            >
              {bulkFlagLoading === "feature" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Flag className="h-4 w-4" />
              )}
              <span className="hidden sm:block">{t("bulk.flagFeatured")}</span>
            </Button>
          )}
          {canFlagNotFeatured && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkFeatureUpdate(false)}
              disabled={bulkFlagLoading !== null}
              className="bg-background/70"
            >
              {bulkFlagLoading === "unfeature" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FlagOff className="h-4 w-4" />
              )}
              <span className="hidden sm:block">
                {t("bulk.flagNotFeatured")}
              </span>
            </Button>
          )}
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setConfirmBulkDelete(true)}
            className="bg-background/70"
          >
            <Trash2 />
            <span className="hidden sm:block">{actionsT("delete")}</span>(
            {selectedIds.size})
          </Button>
        </div>
      )}
    </div>
  );

  const listContent = (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {visibleItems.map((item) => (
          <Card
            key={item.id}
            role="button"
            tabIndex={0}
            onClick={() => {
              start();
              router.push(editHref(item.id));
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                start();
                router.push(editHref(item.id));
              }
            }}
            className="group cursor-pointer overflow-hidden rounded-xl border-border/60 bg-card/60 shadow-lg transition-transform duration-200 ease-out hover:border-accent hover:bg-accent/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-muted/20">
              {!loadedImages[item.id] && (
                <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-background/30">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                sizes="(max-width: 480px) 45vw, (max-width: 768px) 30vw, 20vw"
                className={`h-full w-full object-cover transition-opacity duration-300 ${loadedImages[item.id] ? "opacity-100" : "opacity-0"}`}
                loading="eager"
                onLoad={() =>
                  setLoadedImages((prev) => ({ ...prev, [item.id]: true }))
                }
              />
              {item.featured ? (
                <div className="absolute left-2 top-2">
                  <Badge variant="accent">{t("featured")}</Badge>
                </div>
              ) : null}
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  toggleSelectId(item.id);
                }}
                onPointerDown={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
                className="absolute right-2 top-2 rounded-md bg-background/80 p-1 transition-colors hover:bg-background"
                aria-label={`Select ${item.title}`}
              >
                {selectedIds.has(item.id) ? (
                  <CheckSquare2 className="h-5 w-5 text-accent" />
                ) : (
                  <Square className="h-5 w-5 text-muted-foreground hover:text-accent" />
                )}
              </button>
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Heading
                    serif={false}
                    size="sm"
                    className="transition-colors group-hover:text-accent"
                  >
                    {item.title}
                  </Heading>
                  <Text size="sm" muted className="capitalize">
                    {item.category}
                  </Text>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {visibleCount < items.length ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={t("title")}
        subtitle={t("description")}
        actions={
          <div className="flex gap-2">
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
              href={uploadHref}
              className="bg-background/70"
            >
              <Upload />
              {t("uploadButton")}
            </Button>
          </div>
        }
      />

      {hasItems && (
        <div className="sticky top-16 z-30 w-full">{bulkActions}</div>
      )}

      {hasItems ? (
        <>
          {listContent}
          <div ref={loadMoreRef} aria-hidden className="h-1 w-full" />
        </>
      ) : (
        emptyState
      )}

      <DeleteConfirmDialog
        open={confirmBulkDelete}
        title={t("bulk.delete.title", { count: selectedIds.size })}
        description={t("bulk.delete.description")}
        cancelLabel={actionsT("cancel")}
        confirmLabel={actionsT("delete")}
        confirmLoadingLabel={actionsT("deleting")}
        onConfirm={handleBulkDelete}
        onCancel={() => setConfirmBulkDelete(false)}
      />
    </div>
  );
}
