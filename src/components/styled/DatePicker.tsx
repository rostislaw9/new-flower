"use client";

import { forwardRef, useMemo } from "react";
import type { Matcher } from "react-day-picker";

import { endOfDay, format, startOfDay } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  id?: string;
  value?: string;
  placeholder?: string;
  clearLabel?: string;
  disabled?: boolean;
  ariaLabel?: string;
  onChange: (value: string) => void;
  className?: string;
  hasError?: boolean;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Matcher | Matcher[];
  formatDateLabel?: (date: Date) => string;
}

export const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      id,
      value,
      placeholder = "Pick a date",
      clearLabel = "Clear",
      disabled,
      ariaLabel,
      onChange,
      className,
      hasError,
      minDate,
      maxDate,
      disabledDates,
      formatDateLabel,
    },
    ref,
  ) => {
    const selectedDate = useMemo(() => {
      if (!value) return undefined;
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? undefined : date;
    }, [value]);

    const handleSelect = (date: Date | undefined) => {
      if (!date) {
        onChange("");
        return;
      }
      onChange(format(date, "yyyy-MM-dd"));
    };

    const disabledMatchers = useMemo(() => {
      const matchers: Matcher[] = [];
      if (minDate) {
        matchers.push({ before: startOfDay(minDate) });
      }
      if (maxDate) {
        matchers.push({ after: endOfDay(maxDate) });
      }
      if (disabledDates) {
        matchers.push(
          ...(Array.isArray(disabledDates) ? disabledDates : [disabledDates]),
        );
      }
      return matchers;
    }, [disabledDates, maxDate, minDate]);

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            ref={ref}
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground",
              hasError &&
                "border-destructive/60 focus-visible:ring-destructive/50",
              className,
            )}
            disabled={disabled}
            aria-label={ariaLabel}
            aria-invalid={hasError || undefined}
            type="button"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate
              ? (formatDateLabel?.(selectedDate) ?? format(selectedDate, "PPP"))
              : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            disabled={disabledMatchers.length ? disabledMatchers : undefined}
          />
          {value && (
            <div className="border-t p-1 text-right">
              <Button size="sm" variant="ghost" onClick={() => onChange("")}>
                {clearLabel}
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    );
  },
);

DatePicker.displayName = "DatePicker";
