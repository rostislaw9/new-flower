import type { ComponentProps, ReactNode } from "react";

import { Heading, Text } from "@/components/styled/Typography";
import { cn } from "@/lib/utils";

type HeadingSize = ComponentProps<typeof Heading>["size"];
type HeadingTag = ComponentProps<typeof Heading>["as"];

interface AdminPageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  className?: string;
  headingSize?: HeadingSize;
  headingAs?: HeadingTag;
}

export function AdminPageHeader({
  title,
  subtitle,
  actions,
  className,
  headingSize = "lg",
  headingAs = "h1",
}: AdminPageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-6",
        !actions && "gap-2",
        className,
      )}
    >
      <div className="flex flex-col">
        <Heading serif={false} as={headingAs} size={headingSize}>
          {title}
        </Heading>
        {subtitle && <Text muted>{subtitle}</Text>}
      </div>
      {actions}
    </div>
  );
}
