"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Image from "next/image";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { ChevronLeft, ChevronRight, LoaderCircle, X } from "lucide-react";

import { Eyebrow, Heading, Text } from "@/components/styled/Typography";
import { cn } from "@/lib/utils";

function getLightboxImageDimensions(
  imageWidth: number,
  imageHeight: number,
  viewportWidth: number,
  viewportHeight: number,
) {
  const aspectRatio = imageWidth / imageHeight;

  const maxWidth = viewportWidth * 0.8;
  const maxHeight = viewportHeight * 0.8;

  let width = maxWidth;
  let height = width / aspectRatio;

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
  };
}

export interface LightboxItem {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  category?: string | null;
  width: number;
  height: number;
  unoptimized?: boolean;
}

interface LightboxProps {
  items: LightboxItem[];
  totalCount?: number | undefined;
  hasMore?: boolean;
  activeIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function Lightbox({
  items,
  totalCount,
  hasMore,
  activeIndex,
  onClose,
  onNavigate,
}: LightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const isOpen = activeIndex !== null;
  const activeItem = activeIndex !== null ? (items[activeIndex] ?? null) : null;
  const hasPrev = activeIndex !== null && activeIndex > 0;
  const hasNext =
    activeIndex !== null &&
    (activeIndex < items.length - 1 || hasMore === true);
  const [imageLoading, setImageLoading] = useState(true);
  const shouldUnoptimize = activeItem?.unoptimized ?? false;

  const handlePrev = useCallback(() => {
    if (activeIndex !== null && hasPrev) onNavigate(activeIndex - 1);
  }, [activeIndex, hasPrev, onNavigate]);

  const handleNext = useCallback(() => {
    if (activeIndex !== null && hasNext) onNavigate(activeIndex + 1);
  }, [activeIndex, hasNext, onNavigate]);

  const imageDimensions = useMemo(() => {
    if (!activeItem) {
      return { width: 1200, height: 800 };
    }

    const viewportWidth =
      typeof window !== "undefined" ? window.innerWidth : 1500;

    const viewportHeight =
      typeof window !== "undefined" ? window.innerHeight : 1000;

    return getLightboxImageDimensions(
      activeItem.width,
      activeItem.height,
      viewportWidth,
      viewportHeight,
    );
  }, [activeItem]);

  useEffect(() => {
    if (!isOpen) return;

    const FOCUSABLE =
      'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowLeft") {
        handlePrev();
        return;
      }
      if (e.key === "ArrowRight") {
        handleNext();
        return;
      }

      if (e.key === "Tab") {
        const dialog = document.querySelector('[role="dialog"]');
        if (!dialog) return;
        const focusable = Array.from(
          dialog.querySelectorAll<HTMLElement>(FOCUSABLE),
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (first === undefined || last === undefined) return;
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  useEffect(() => {
    if (isOpen) closeButtonRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (activeIndex !== null) {
      setImageLoading(true);
      const img = imgRef.current;
      if (img?.complete && img.naturalWidth > 0) {
        setImageLoading(false);
      }
    }
  }, [activeIndex]);

  const y = useMotionValue(0);
  const opacity = useTransform(y, [-300, 0, 300], [0.2, 1, 0.2]);

  return (
    <AnimatePresence>
      {isOpen && activeItem && (
        <motion.div
          key="lightbox-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[500] flex items-center justify-center bg-background/90 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.title}
          onClick={onClose}
        >
          {/* Close */}
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Close lightbox"
            onClick={onClose}
            className="absolute right-4 top-4 z-[500] flex h-10 w-10 items-center justify-center text-muted-foreground outline-none transition-colors duration-300 hover:text-accent sm:right-6 sm:top-6"
          >
            <X />
          </button>

          {/* Prev */}
          <button
            type="button"
            aria-label="Previous image"
            disabled={!hasPrev}
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className={cn(
              "absolute left-0 top-1/2 z-[500] flex h-10 w-10 -translate-y-1/2 items-center justify-center text-muted-foreground transition-all duration-300 hover:text-accent sm:left-6",
              !hasPrev && "pointer-events-none opacity-20",
            )}
          >
            <ChevronLeft />
          </button>

          {/* Next */}
          <button
            type="button"
            aria-label="Next image"
            disabled={!hasNext}
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className={cn(
              "absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-muted-foreground transition-all duration-300 hover:text-accent sm:right-6",
              !hasNext && "pointer-events-none opacity-20",
            )}
          >
            <ChevronRight />
          </button>

          {/* Image + meta */}
          <motion.div
            key={activeItem.id}
            style={{ y, opacity }}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            drag
            dragDirectionLock
            dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
            dragElastic={0.2}
            dragMomentum={false}
            onDragEnd={(_, info) => {
              const horizontalThreshold = 100;
              const horizontalVelocity = 500;

              const verticalThreshold = 200;
              const verticalVelocity = 650;

              if (
                info.offset.y > verticalThreshold ||
                info.velocity.y > verticalVelocity
              ) {
                onClose();
                return;
              }

              if (
                info.offset.x < -horizontalThreshold ||
                info.velocity.x < -horizontalVelocity
              ) {
                handleNext();
                return;
              }

              if (
                info.offset.x > horizontalThreshold ||
                info.velocity.x > horizontalVelocity
              ) {
                handlePrev();
              }
            }}
            className="flex touch-none select-none flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative flex items-center justify-center"
              style={{
                width: `${imageDimensions.width}px`,
                height: `${imageDimensions.height}px`,
              }}
            >
              {imageLoading && (
                <div className="absolute inset-0 z-[500] flex items-center justify-center bg-background/30">
                  <LoaderCircle className="h-10 w-10 animate-spin text-muted-foreground" />
                </div>
              )}
              <Image
                ref={imgRef}
                src={activeItem.imageUrl}
                alt={activeItem.title}
                fill
                sizes="80vw"
                draggable={false}
                className={cn(
                  "pointer-events-none select-none object-contain transition-opacity duration-300",
                  imageLoading ? "opacity-0" : "opacity-100",
                )}
                preload
                unoptimized={shouldUnoptimize}
                onLoad={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
              />
            </div>

            <div
              className="grid w-full grid-cols-2 gap-x-4 gap-y-2"
              style={{
                width: `${imageDimensions.width}px`,
              }}
            >
              <Heading size="sm">{activeItem.title}</Heading>
              {activeItem.category && (
                <Eyebrow className="text-right">{activeItem.category}</Eyebrow>
              )}
              {activeItem.description && (
                <Text muted className="col-span-2 max-w-[80vw]">
                  {activeItem.description}
                </Text>
              )}
            </div>

            {/* Counter */}
            {activeIndex !== null && (
              <p className="font-sans text-xs text-muted-foreground/40">
                {activeIndex + 1} / {totalCount ?? items.length}
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
