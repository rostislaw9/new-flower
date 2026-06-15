import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionSize = "sm" | "md" | "lg" | "xl";

interface SectionProps {
  children: ReactNode;
  className?: string;
  size?: SectionSize;
  id?: string;
}

const sizeClasses: Record<SectionSize, string> = {
  sm: "py-12 md:py-16",
  md: "py-16 md:py-24",
  lg: "py-24 md:py-32",
  xl: "py-32 md:py-48",
};

export function Section({
  children,
  className,
  size = "md",
  id,
}: SectionProps) {
  return (
    <section id={id} className={cn(sizeClasses[size], className)}>
      {children}
    </section>
  );
}
