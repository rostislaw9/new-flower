import * as React from "react";

import { cn } from "@/lib/utils";

export function AdminPageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl space-y-8 p-6", className)}>
      {children}
    </div>
  );
}
