import type { ReactNode } from "react";

import { Eyebrow, Text } from "@/components/styled/Typography";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BookingBookingProps {
  eyebrow: string;
  children: ReactNode;
  hint?: string;
  className?: string;
  contentClassName?: string;
}

export function BookingSectionCard({
  eyebrow,
  hint,
  children,
  className,
  contentClassName,
}: BookingBookingProps) {
  return (
    <Card
      className={cn(
        "rounded-2xl border border-border/60 bg-card/60 shadow-md",
        className,
      )}
    >
      <CardContent className={cn("space-y-4 p-6", contentClassName)}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Eyebrow>{eyebrow}</Eyebrow>
          {hint && (
            <Text size="xs" muted className="font-mono uppercase">
              {hint}
            </Text>
          )}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
