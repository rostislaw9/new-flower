import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface HeadingProps {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  size?: "display" | "headline" | "title" | "lg" | "md" | "sm" | "xs" | "2xs";
  serif?: boolean;
}

const headingSizeClasses = {
  display: "text-display tracking-tight text-balance",
  headline: "text-headline tracking-tight text-balance",
  title: "text-title tracking-tight text-balance",
  lg: "text-3xl tracking-tight",
  md: "text-2xl tracking-tight",
  sm: "text-xl tracking-tight",
  xs: "text-md tracking-tight",
  "2xs": "text-sm tracking-tight",
};

export function Heading({
  children,
  className,
  as: Tag = "h2",
  size = "headline",
  serif = true,
}: HeadingProps) {
  return (
    <Tag
      className={cn(
        headingSizeClasses[size],
        serif ? "font-display" : "font-sans",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

interface TextProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  size?: "lg" | "md" | "sm" | "xs";
  muted?: boolean;
}

const textSizeClasses = {
  lg: "text-lg leading-relaxed",
  md: "text-base leading-relaxed",
  sm: "text-sm leading-relaxed",
  xs: "text-xs leading-relaxed",
};

export function Text({
  children,
  className,
  as: Tag = "p",
  size = "md",
  muted = false,
}: TextProps) {
  return (
    <Tag
      className={cn(
        textSizeClasses[size],
        muted && "text-muted-foreground",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

interface EyebrowProps {
  children: ReactNode;
  className?: string;
  size?: "lg" | "md" | "sm" | "xs";
  muted?: boolean;
}

export function Eyebrow({
  children,
  className,
  size = "sm",
  muted = false,
}: EyebrowProps) {
  return (
    <p
      className={cn(
        textSizeClasses[size],
        "font-sans font-semibold uppercase tracking-widest text-accent",
        muted && "text-muted-foreground",
        className,
      )}
    >
      {children}
    </p>
  );
}
