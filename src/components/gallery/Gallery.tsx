"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { CategoryFilter } from "@/components/gallery/CategoryFilter";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { Lightbox } from "@/components/gallery/Lightbox";
import type { GalleryCategory, GalleryItem } from "@/lib/gallery-data";
import { GALLERY_CATEGORIES } from "@/lib/gallery-data";

interface GalleryProps {
  items: GalleryItem[];
  scrollableClassName: string;
  pageSize?: number;
  totalCount?: number;
  categoryCounts?: Record<GalleryCategory, number>;
}

interface GalleryApiResponse {
  items: GalleryItem[];
  total: number;
  hasMore: boolean;
  nextOffset: number;
}

const DEFAULT_PAGE_SIZE = 10;

export function Gallery({
  items,
  scrollableClassName,
  pageSize = DEFAULT_PAGE_SIZE,
  totalCount,
  categoryCounts,
}: GalleryProps) {
  const initialHasMore = (totalCount ?? items.length) > items.length;
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [offset, setOffset] = useState(items.length);
  const [itemsState, setItemsState] = useState(items);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<GalleryCategory | null>(
    null,
  );

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
      category: GalleryCategory | null;
      replace: boolean;
    }) => {
      const params = new URLSearchParams();
      params.set("limit", String(pageSize));
      params.set("offset", String(offsetValue));
      if (category) {
        params.set("category", category);
      }

      const response = await fetch(`/api/gallery/public?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch gallery items");
      }

      const data = (await response.json()) as GalleryApiResponse;

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
        console.error("[Gallery] Failed to load category", error);
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
            console.error("[Gallery] Failed to load more", error);
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

  useEffect(() => {
    if (lightboxIndex === null) return;
    if (!hasMore || isLoadingMore || isCategoryLoading) return;
    if (lightboxIndex < filteredItems.length - 3) return;

    setIsLoadingMore(true);
    fetchItems({
      offset,
      category: activeCategory,
      replace: false,
    })
      .catch((error) => {
        console.error("[Gallery] Failed to load more (lightbox)", error);
      })
      .finally(() => {
        setIsLoadingMore(false);
      });
  }, [
    lightboxIndex,
    filteredItems.length,
    hasMore,
    isLoadingMore,
    isCategoryLoading,
    offset,
    activeCategory,
    fetchItems,
  ]);

  return (
    <>
      <div className="flex flex-col gap-2">
        {categoryCounts && (
          <CategoryFilter
            categories={GALLERY_CATEGORIES}
            active={activeCategory}
            counts={categoryCounts}
            onSelect={(category) => {
              setActiveCategory(category);
              setLightboxIndex(null);
            }}
          />
        )}
        <GalleryGrid
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
        totalCount={totalCount}
        hasMore={hasMore}
        activeIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={(index) => setLightboxIndex(index)}
      />
    </>
  );
}
