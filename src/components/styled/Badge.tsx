import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "secondary"
  | "accent"
  | "outline"
  | "destructive"
  | "pending"
  | "contacted"
  | "approved"
  | "completed"
  | "rejected";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-primary text-primary-foreground border border-primary",
  secondary: "bg-secondary text-secondary-foreground border border-border",
  accent: "bg-secondary text-accent border border-accent",
  outline: "bg-transparent text-muted-foreground border border-border",
  destructive: "bg-destructive text-primary-foreground border border-border",
  pending: "bg-amber-700/10 text-amber-500 border border-amber-500/30",
  contacted: "bg-sky-700/10 text-sky-500 border border-sky-500/30",
  approved: "bg-emerald-700/10 text-emerald-500 border border-emerald-500/30",
  completed: "bg-slate-700/10 text-slate-500 border border-slate-500/30",
  rejected: "bg-rose-700/10 text-rose-500 border border-rose-500/30",
};

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 font-sans text-xs font-semibold uppercase tracking-wider",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
