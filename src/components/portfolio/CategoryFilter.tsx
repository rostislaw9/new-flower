"use client";

import { useEffect, useRef, useState } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/styled/Button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { PortfolioCategory } from "@/lib/portfolio-data";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: PortfolioCategory[];
  active: PortfolioCategory | null;
  counts: Record<PortfolioCategory, number>;
  onSelect: (category: PortfolioCategory | null) => void;
}

export function CategoryFilter({
  categories,
  active,
  counts,
  onSelect,
}: CategoryFilterProps) {
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
  }, [categories]);

  const scrollByViewport = (direction: "left" | "right") => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const amount = viewport.clientWidth * 0.45;
    viewport.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <nav aria-label="Filter portfolio by category" className="relative">
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByViewport("left")}
          className="absolute -left-4 top-1/2 z-20 -translate-y-[65%] p-2 text-muted-foreground transition hover:text-accent"
          aria-label="Scroll gallery categories left"
        >
          <ChevronLeft muted-foreground />
        </button>
      )}

      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByViewport("right")}
          className="absolute -right-4 top-1/2 z-20 -translate-y-[65%] p-2 text-muted-foreground transition hover:text-accent"
          aria-label="Scroll gallery categories right"
        >
          <ChevronRight />
        </button>
      )}

      <ScrollArea ref={scrollAreaRef} className="w-full whitespace-nowrap">
        <CategoryFilterList
          categories={categories}
          active={active}
          counts={counts}
          onSelect={onSelect}
        />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <div
        className={`pointer-events-none absolute inset-y-0 left-0 -ml-1 h-10 w-20 bg-gradient-to-r from-background via-background/70 to-transparent shadow-[inset_20px_0_20px_rgba(15,15,15,0.1)] transition-opacity duration-500 ${canScrollLeft ? "opacity-100" : "opacity-0"}`}
        aria-hidden
      />

      <div
        className={`pointer-events-none absolute inset-y-0 right-0 -mr-1 h-10 w-20 bg-gradient-to-l from-background via-background/70 to-transparent shadow-[inset_-20px_0_20px_rgba(15,15,15,0.1)] transition-opacity duration-500 ${canScrollRight ? "opacity-100" : "opacity-0"}`}
        aria-hidden
      />
    </nav>
  );
}

function CategoryFilterList({
  categories,
  active,
  counts,
  onSelect,
}: CategoryFilterProps) {
  return (
    <ul className="flex gap-2 pb-3 md:flex-wrap" role="list">
      <li>
        <Button
          type="button"
          size="sm"
          variant={active === null ? "default" : "outline"}
          aria-pressed={active === null}
          onClick={() => onSelect(null)}
        >
          All
          <span
            className={cn(
              "tabular-nums",
              active === null
                ? "text-background/60"
                : "text-muted-foreground/50",
            )}
          >
            {Object.values(counts).reduce((a, b) => a + b, 0)}
          </span>
        </Button>
      </li>
      {categories.map((category) => (
        <li key={category}>
          <Button
            type="button"
            size="sm"
            variant={active === category ? "default" : "outline"}
            aria-pressed={active === category}
            onClick={() => onSelect(category)}
          >
            {category}
            <span
              className={cn(
                "tabular-nums",
                active === category
                  ? "text-background/60"
                  : "text-muted-foreground/50",
              )}
            >
              {counts[category]}
            </span>
          </Button>
        </li>
      ))}
    </ul>
  );
}
