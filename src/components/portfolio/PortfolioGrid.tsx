"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";

import { motion } from "framer-motion";

import { Text } from "@/components/styled/Typography";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import type { PortfolioItem } from "@/lib/portfolio-data";

interface PortfolioGridProps {
  items: PortfolioItem[];
  onSelect: (index: number) => void;
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

export function PortfolioGrid({ items, onSelect }: PortfolioGridProps) {
  const t = useTranslations("portfolio");

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

  return (
    <motion.ul
      key={items.map((i) => i.id).join(",")}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3 lg:grid-cols-4"
      role="list"
      aria-label="Portfolio gallery"
    >
      {items.map((item, index) => (
        <motion.li
          key={item.id}
          variants={itemVariants}
          className="bg-background"
          role="listitem"
        >
          <button
            type="button"
            onClick={() => onSelect(index)}
            className="group relative block aspect-[3/4] w-full overflow-hidden bg-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
            aria-label={`Open ${item.title}`}
          >
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-600 ease-premium group-hover:scale-[1.03]"
              loading={index < 6 ? "eager" : "lazy"}
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
    </motion.ul>
  );
}
