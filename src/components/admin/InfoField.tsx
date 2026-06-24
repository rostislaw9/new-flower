import type { ReactNode } from "react";

import Link from "next/link";

import { Text } from "@/components/styled/Typography";
import { cn } from "@/lib/utils";

interface InfoFieldProps {
  label: string;
  value: ReactNode;
  valueHref?: string;
  className?: string;
}

export function InfoField({
  label,
  value,
  valueHref,
  className,
}: InfoFieldProps) {
  const valueClasses = "mt-3 text-base font-semibold leading-snug";

  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-card p-4 shadow-lg",
        className,
      )}
    >
      <Text size="sm" muted>
        {label}
      </Text>
      {valueHref ? (
        <Link
          href={valueHref}
          className={cn(
            valueClasses,
            "inline-flex text-primary underline-offset-4 transition hover:underline",
          )}
        >
          {value}
        </Link>
      ) : (
        <div className={cn(valueClasses, "text-foreground")}>{value}</div>
      )}
    </div>
  );
}
