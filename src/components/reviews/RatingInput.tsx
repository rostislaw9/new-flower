"use client";

import { useEffect, useState } from "react";

import { Star } from "lucide-react";

import { Button } from "@/components/styled/Button";

interface RatingInputProps {
  label?: string;
  helpText?: string;
  ariaLabels: string[];
  name?: string;
  initialValue?: number | null;
  value?: number | null;
  onChange?: (value: number) => void;
  error?: string;
  disabled?: boolean;
}

export function RatingInput({
  label,
  helpText,
  ariaLabels,
  name = "rating",
  initialValue,
  value,
  onChange,
  error,
  disabled,
}: RatingInputProps) {
  const [internalValue, setInternalValue] = useState<number | null>(
    initialValue ?? null,
  );
  const isControlled = value !== undefined;
  const resolvedValue = isControlled ? value : internalValue;

  useEffect(() => {
    if (!isControlled) {
      setInternalValue(initialValue ?? null);
    }
  }, [initialValue, isControlled]);

  const handleSelect = (nextValue: number) => {
    if (!isControlled) {
      setInternalValue(nextValue);
    }
    onChange?.(nextValue);
  };
  const ratingButtons = [1, 2, 3, 4, 5];

  return (
    <div className="flex flex-col gap-2">
      {label ? (
        <label className="text-sm font-medium text-foreground">{label}</label>
      ) : null}
      {helpText ? (
        <p className="text-sm text-muted-foreground">{helpText}</p>
      ) : null}
      <div className="flex">
        {ratingButtons.map((ratingValue, index) => {
          const isActive =
            resolvedValue !== null && ratingValue <= resolvedValue;
          return (
            <Button
              variant="accent"
              size="icon-borderless"
              type="button"
              key={ratingValue}
              onClick={() => handleSelect(ratingValue)}
              className="rounded-full hover:bg-transparent hover:text-accent"
              aria-pressed={isActive}
              disabled={disabled}
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
      <input type="hidden" name={name} value={resolvedValue ?? ""} />
    </div>
  );
}
