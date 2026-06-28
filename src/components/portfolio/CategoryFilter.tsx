"use client";

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
  return (
    <nav aria-label="Filter portfolio by category">
      <ScrollArea className="w-full whitespace-nowrap">
        <CategoryFilterList
          categories={categories}
          active={active}
          counts={counts}
          onSelect={onSelect}
        />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
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
