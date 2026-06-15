"use client";

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
      <ul className="flex flex-wrap gap-2" role="list">
        <li>
          <button
            type="button"
            aria-pressed={active === null}
            onClick={() => onSelect(null)}
            className={cn(
              "inline-flex h-8 items-center gap-2 border px-4 font-sans text-2xs font-semibold uppercase tracking-widest transition-all duration-300 ease-premium",
              active === null
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-transparent text-muted-foreground hover:border-foreground/40 hover:text-foreground",
            )}
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
          </button>
        </li>
        {categories.map((category) => (
          <li key={category}>
            <button
              type="button"
              aria-pressed={active === category}
              onClick={() => onSelect(category)}
              className={cn(
                "inline-flex h-8 items-center gap-2 border px-4 font-sans text-2xs font-semibold uppercase tracking-widest transition-all duration-300 ease-premium",
                active === category
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-transparent text-muted-foreground hover:border-foreground/40 hover:text-foreground",
              )}
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
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
