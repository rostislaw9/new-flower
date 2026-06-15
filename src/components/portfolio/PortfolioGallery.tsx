"use client";

import { useMemo, useState } from "react";

import { CategoryFilter } from "@/components/portfolio/CategoryFilter";
import { Lightbox, type LightboxItem } from "@/components/portfolio/Lightbox";
import { PortfolioGrid } from "@/components/portfolio/PortfolioGrid";
import type { PortfolioCategory, PortfolioItem } from "@/lib/portfolio-data";
import { PORTFOLIO_CATEGORIES } from "@/lib/portfolio-data";

interface PortfolioGalleryProps {
  items: PortfolioItem[];
  showCategoryFilter?: boolean;
}

export function PortfolioGallery({
  items,
  showCategoryFilter = true,
}: PortfolioGalleryProps) {
  const [activeCategory, setActiveCategory] =
    useState<PortfolioCategory | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredItems = useMemo(
    () =>
      activeCategory === null
        ? items
        : items.filter((item) => item.category === activeCategory),
    [items, activeCategory],
  );

  const counts = useMemo(
    () =>
      PORTFOLIO_CATEGORIES.reduce<Record<PortfolioCategory, number>>(
        (acc, cat) => {
          acc[cat] = items.filter((item) => item.category === cat).length;
          return acc;
        },
        {} as Record<PortfolioCategory, number>,
      ),
    [items],
  );

  const lightboxItems = useMemo<LightboxItem[]>(
    () =>
      filteredItems.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        imageUrl: item.imageUrl,
        category: item.category,
        width: item.width,
        height: item.height,
      })),
    [filteredItems],
  );

  const handleCategorySelect = (category: PortfolioCategory | null) => {
    setActiveCategory(category);
    setLightboxIndex(null);
  };

  return (
    <>
      <div className="flex flex-col gap-8">
        {showCategoryFilter && (
          <CategoryFilter
            categories={PORTFOLIO_CATEGORIES}
            active={activeCategory}
            counts={counts}
            onSelect={handleCategorySelect}
          />
        )}
        <PortfolioGrid
          items={filteredItems}
          onSelect={(index) => setLightboxIndex(index)}
        />
      </div>

      <Lightbox
        items={lightboxItems}
        activeIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={(index) => setLightboxIndex(index)}
      />
    </>
  );
}
