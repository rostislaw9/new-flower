"use client";

import { useState } from "react";

import { Star } from "lucide-react";

import { Button } from "@/components/styled/Button";

interface RatingInputProps {
  label: string;
  helpText: string;
  ariaLabels: string[];
  name?: string;
  initialValue?: number | null;
  error?: string;
}

export function RatingInput({
  label,
  helpText,
  ariaLabels,
  name = "rating",
  initialValue,
  error,
}: RatingInputProps) {
  const [value, setValue] = useState<number | null>(initialValue ?? null);
  const ratingButtons = [1, 2, 3, 4, 5];

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <p className="text-sm text-muted-foreground">{helpText}</p>
      <div className="flex">
        {ratingButtons.map((ratingValue, index) => {
          const isActive = value !== null && ratingValue <= value;
          return (
            <Button
              variant="accent"
              size="icon-borderless"
              type="button"
              key={ratingValue}
              onClick={() => setValue(ratingValue)}
              className="rounded-full hover:bg-transparent hover:text-accent"
              aria-pressed={isActive}
              aria-label={
                ariaLabels[index] ?? ariaLabels[ariaLabels.length - 1] ?? ""
              }
            >
              <Star
                className="h-5 w-5"
                strokeWidth={1.5}
                fill={isActive ? "currentColor" : "none"}
                color={isActive ? "currentColor" : undefined}
              />
              <span className="sr-only">{ratingValue}</span>
            </Button>
          );
        })}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <input type="hidden" name={name} value={value ?? ""} />
    </div>
  );
}
