"use client";

import { useEffect, useRef, useState } from "react";

import { useTranslations } from "next-intl";
import Image from "next/image";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

import { Text } from "@/components/styled/Typography";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { GalleryItem } from "@/lib/gallery-data";

interface GalleryGridProps {
  items: GalleryItem[];
  onSelect: (index: number) => void;
  scrollableClassName: string;
  loadMoreRef?: React.RefObject<HTMLDivElement | null> | undefined;
  isLoadingMore?: boolean | undefined;
  isCategoryLoading?: boolean | undefined;
  hasMore?: boolean | undefined;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const EASE_PREMIUM = [0.16, 1, 0.3, 1] as [number, number, number, number];

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_PREMIUM },
  },
};

export function GalleryGrid({
  items,
  onSelect,
  scrollableClassName,
  loadMoreRef,
  isLoadingMore,
  isCategoryLoading,
  hasMore,
}: GalleryGridProps) {
  const t = useTranslations("gallery");
  const [loadedIds, setLoadedIds] = useState<Record<string, boolean>>({});
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const root = scrollAreaRef.current;
    if (!root) {
      return;
    }

    const viewport = root.querySelector(
      "[data-radix-scroll-area-viewport]",
    ) as HTMLDivElement | null;
    if (!viewport) {
      return;
    }

    viewportRef.current = viewport;

    const updateScrollState = () => {
      if (!viewportRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = viewportRef.current;
      setCanScrollLeft(scrollLeft > 8);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 8);
    };

    updateScrollState();
    viewport.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => updateScrollState());
      resizeObserver.observe(viewport);
    }

    return () => {
      viewport.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
      resizeObserver?.disconnect();
    };
  }, [items.length]);

  const scrollByViewport = (direction: "left" | "right") => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const amount = viewport.clientWidth * 0.8;
    viewport.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (items.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyTitle>
            <Text muted>{t("noItems")}</Text>
          </EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  const gridContent = (
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid auto-cols-[50%] grid-flow-col grid-rows-2 bg-border sm:auto-cols-[40%] md:auto-cols-[30%] lg:auto-cols-[20%] max-md:landscape:auto-cols-[20%] max-md:landscape:grid-rows-1"
      role="list"
      aria-label="Gallery"
    >
      {items.map((item, index) => (
        <motion.li
          key={item.id}
          variants={itemVariants}
          className="bg-background p-px"
          role="listitem"
        >
          <button
            type="button"
            onClick={() => onSelect(index)}
            className="group relative block aspect-[3/4] w-full overflow-hidden bg-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
            aria-label={`Open ${item.title}`}
          >
            {!loadedIds[item.id] && (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-background/30">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition-transform duration-600 ease-premium group-hover:scale-[1.03] ${loadedIds[item.id] ? "opacity-100" : "opacity-0"}`}
              loading={index < 10 ? "eager" : "lazy"}
              onLoad={() =>
                setLoadedIds((prev) => ({ ...prev, [item.id]: true }))
              }
            />
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-background/80 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-400 ease-premium group-hover:opacity-100">
              <p className="font-display text-sm font-light text-foreground">
                {item.title}
              </p>
              <p className="font-sans text-2xs font-semibold uppercase tracking-widest text-accent">
                {item.category}
              </p>
            </div>
          </button>
        </motion.li>
      ))}
      {(isCategoryLoading || isLoadingMore) && (
        <div className="row-span-full flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-muted-foreground" />
        </div>
      )}
      {loadMoreRef && hasMore && (
        <div
          ref={loadMoreRef}
          aria-hidden
          className="row-span-full h-full w-1"
        />
      )}
    </motion.ul>
  );

  return (
    <div className="relative">
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByViewport("left")}
          className="absolute -left-4 top-1/2 z-20 -translate-y-1/2 p-2 text-muted-foreground transition hover:text-accent"
          aria-label="Scroll gallery left"
        >
          <ChevronLeft />
        </button>
      )}

      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByViewport("right")}
          className="absolute -right-4 top-1/2 z-20 -translate-y-1/2 p-2 text-muted-foreground transition hover:text-accent"
          aria-label="Scroll gallery right"
        >
          <ChevronRight />
        </button>
      )}

      <ScrollArea ref={scrollAreaRef} className={scrollableClassName}>
        {gridContent}
        <ScrollBar orientation="horizontal" className="hidden" />
      </ScrollArea>

      <div
        className={`pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background via-background/20 to-transparent shadow-[inset_20px_0_20px_rgba(50,50,50,0.1)] transition-opacity duration-500 ${canScrollLeft ? "opacity-100" : "opacity-0"}`}
        aria-hidden
      />

      <div
        className={`pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background via-background/20 to-transparent shadow-[inset_-20px_0_20px_rgba(50,50,50,0.1)] transition-opacity duration-500 ${canScrollRight ? "opacity-100" : "opacity-0"}`}
        aria-hidden
      />
    </div>
  );
}
