"use client";

import { useMemo, useState } from "react";

import Image from "next/image";

import { Lightbox, type LightboxItem } from "@/components/gallery/Lightbox";
import { Text } from "@/components/styled/Typography";

export interface BookingReferenceItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  width: number;
  height: number;
}

interface BookingReferencesGalleryProps {
  items: BookingReferenceItem[];
  emptyLabel: string;
}

export function BookingReferencesGallery({
  items,
  emptyLabel,
}: BookingReferencesGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const requiresUnoptimized = (url: string) => /^https?:\/\//i.test(url);
  const lightboxItems = useMemo<LightboxItem[]>(
    () =>
      items.map((item) => ({
        id: item.id,
        title: item.title,
        imageUrl: item.imageUrl,
        width: item.width,
        height: item.height,
        unoptimized: requiresUnoptimized(item.imageUrl),
      })),
    [items],
  );

  if (items.length === 0) {
    return <Text muted>{emptyLabel}</Text>;
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="group relative overflow-hidden border border-border bg-muted/20"
            aria-label={item.title}
          >
            <div className="relative aspect-[3/4] w-full">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                loading="eager"
                unoptimized={requiresUnoptimized(item.imageUrl)}
              />
            </div>
          </button>
        ))}
      </div>

      <Lightbox
        items={lightboxItems}
        activeIndex={activeIndex}
        onClose={() => setActiveIndex(null)}
        onNavigate={(index) => setActiveIndex(index)}
      />
    </>
  );
}
