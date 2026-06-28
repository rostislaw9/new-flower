"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useTranslations } from "next-intl";

import { CategoryFilter } from "@/components/portfolio/CategoryFilter";
import { Lightbox } from "@/components/portfolio/Lightbox";
import { PortfolioGrid } from "@/components/portfolio/PortfolioGrid";
import { Text } from "@/components/styled/Typography";
import type { PortfolioCategory, PortfolioItem } from "@/lib/portfolio-data";
import { PORTFOLIO_CATEGORIES } from "@/lib/portfolio-data";

interface PortfolioGalleryProps {
  items: PortfolioItem[];
  scrollableClassName: string;
  pageSize?: number;
  totalCount?: number;
  categoryCounts?: Record<PortfolioCategory, number>;
}

interface PortfolioApiResponse {
  items: PortfolioItem[];
  total: number;
  hasMore: boolean;
  nextOffset: number;
}

const DEFAULT_PAGE_SIZE = 10;

export function PortfolioGallery({
  items,
  scrollableClassName,
  pageSize = DEFAULT_PAGE_SIZE,
  totalCount,
  categoryCounts,
}: PortfolioGalleryProps) {
  const t = useTranslations("portfolio");

  const initialHasMore = (totalCount ?? items.length) > items.length;
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [offset, setOffset] = useState(items.length);
  const [itemsState, setItemsState] = useState(items);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  const [activeCategory, setActiveCategory] =
    useState<PortfolioCategory | null>(null);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const hasTriggeredRef = useRef(false);
  const allItemsCacheRef = useRef(items);

  useEffect(() => {
    setItemsState(items);
    setOffset(items.length);
    setHasMore(initialHasMore);
    allItemsCacheRef.current = items;
  }, [items, totalCount, initialHasMore]);

  const fetchItems = useCallback(
    async ({
      offset: offsetValue,
      category,
      replace,
    }: {
      offset: number;
      category: PortfolioCategory | null;
      replace: boolean;
    }) => {
      const params = new URLSearchParams();
      params.set("limit", String(pageSize));
      params.set("offset", String(offsetValue));
      if (category) {
        params.set("category", category);
      }

      const response = await fetch(
        `/api/portfolio/public?${params.toString()}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch portfolio items");
      }

      const data = (await response.json()) as PortfolioApiResponse;

      if (replace) {
        setItemsState(data.items);
      } else {
        setItemsState((prev) => [...prev, ...data.items]);
      }

      setOffset(data.nextOffset);
      setHasMore(data.hasMore);

      if (category === null) {
        allItemsCacheRef.current = replace
          ? data.items
          : [...allItemsCacheRef.current, ...data.items];
      }
    },
    [pageSize],
  );

  useEffect(() => {
    if (activeCategory === null) {
      setItemsState(allItemsCacheRef.current);
      return;
    }

    let cancelled = false;
    const loadCategory = async () => {
      setIsCategoryLoading(true);
      try {
        await fetchItems({
          offset: 0,
          category: activeCategory,
          replace: true,
        });
      } catch (error) {
        console.error("[PortfolioGallery] Failed to load category", error);
      } finally {
        if (!cancelled) {
          setIsCategoryLoading(false);
        }
      }
    };

    void loadCategory();
    return () => {
      cancelled = true;
    };
  }, [activeCategory, fetchItems]);

  useEffect(() => {
    if (!hasMore || isLoadingMore || isCategoryLoading) {
      hasTriggeredRef.current = false;
      return;
    }

    const sentinel = loadMoreRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        if (hasTriggeredRef.current) return;

        hasTriggeredRef.current = true;
        observer.disconnect();
        setIsLoadingMore(true);
        fetchItems({
          offset,
          category: activeCategory,
          replace: false,
        })
          .catch((error) => {
            console.error("[PortfolioGallery] Failed to load more", error);
          })
          .finally(() => {
            setIsLoadingMore(false);
          });
      },
      { rootMargin: "50px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [
    activeCategory,
    fetchItems,
    hasMore,
    isCategoryLoading,
    isLoadingMore,
    offset,
  ]);

  const filteredItems =
    activeCategory === null
      ? itemsState
      : itemsState.filter((item) => item.category === activeCategory);

  return (
    <>
      <div className="flex flex-col gap-1">
        {categoryCounts && (
          <>
            <CategoryFilter
              categories={PORTFOLIO_CATEGORIES}
              active={activeCategory}
              counts={categoryCounts}
              onSelect={(category) => {
                setActiveCategory(category);
                setLightboxIndex(null);
              }}
            />
            <Text muted size="xs" className="mb-2 hidden justify-end md:flex">
              {t("scrollHint")}
            </Text>
          </>
        )}
        <PortfolioGrid
          items={filteredItems}
          onSelect={(index) => setLightboxIndex(index)}
          scrollableClassName={scrollableClassName}
          loadMoreRef={loadMoreRef}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          isCategoryLoading={isCategoryLoading}
        />
      </div>

      <Lightbox
        items={filteredItems.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          imageUrl: item.imageUrl,
          category: item.category,
          width: item.width,
          height: item.height,
        }))}
        activeIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={(index) => setLightboxIndex(index)}
      />
    </>
  );
}
