"use client";

import type { ReactNode } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string[] | undefined;
  required?: boolean | undefined;
  hint?: string | undefined;
  children: ReactNode;
}

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  children,
}: FormFieldProps) {
  const hasError = error !== undefined && error.length > 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={htmlFor}>{label}</Label>
        {hint && !hasError && (
          <span className="font-sans text-xs text-muted-foreground">
            {hint}
          </span>
        )}
        {hasError && (
          <span
            id={`${htmlFor}-error`}
            role="alert"
            className="font-sans text-xs text-destructive"
          >
            {error[0]}
          </span>
        )}
      </div>

      <div
        className={cn(
          "transition-colors duration-300",
          hasError &&
            "[&_input]:border-destructive/60 [&_select]:border-destructive/60 [&_textarea]:border-destructive/60",
        )}
      >
        {children}
      </div>
    </div>
  );
}
