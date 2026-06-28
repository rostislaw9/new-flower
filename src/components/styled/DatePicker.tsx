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

type DatePickerBaseProps = {
  id?: string;
  placeholder?: string;
  clearLabel?: string;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
  hasError?: boolean;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Matcher | Matcher[];
  locale?: string;
};

type SingleDatePickerProps = DatePickerBaseProps & {
  mode?: "single";
  value?: string;
  onChange: (value: string) => void;
  formatDateLabel?: (date: Date) => string;
};

type MultipleDatePickerProps = DatePickerBaseProps & {
  mode: "multiple";
  value?: string[];
  onChange: (value: string[]) => void;
  formatDateLabel?: (dates: Date[]) => string;
};

type RangeDatePickerProps = DatePickerBaseProps & {
  mode: "range";
  value?: { from?: string; to?: string } | undefined;
  onChange: (value: { from?: string; to?: string }) => void;
  formatDateLabel?: (range: { from?: Date; to?: Date }) => string;
};

type DatePickerProps =
  | SingleDatePickerProps
  | MultipleDatePickerProps
  | RangeDatePickerProps;

const isSingleProps = (
  props: DatePickerProps,
): props is SingleDatePickerProps =>
  props.mode === undefined || props.mode === "single";

const isMultipleProps = (
  props: DatePickerProps,
): props is MultipleDatePickerProps => props.mode === "multiple";

const isRangeProps = (props: DatePickerProps): props is RangeDatePickerProps =>
  props.mode === "range";

const formatIso = (date: Date): string => format(date, "yyyy-MM-dd");

export const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(
  (props, ref) => {
    const {
      id,
      placeholder = "Pick a date",
      clearLabel = "Clear",
      disabled,
      ariaLabel,
      className,
      hasError,
      minDate,
      maxDate,
      disabledDates,
      locale,
    } = props;

    const singleValue = useMemo(() => {
      if (!isSingleProps(props) || typeof props.value !== "string")
        return undefined;
      const date = new Date(props.value);
      return Number.isNaN(date.getTime()) ? undefined : date;
    }, [props]);

    const multipleValues = useMemo(() => {
      if (!isMultipleProps(props) || !Array.isArray(props.value)) return [];
      return props.value
        .map((value) => new Date(value))
        .filter((date) => !Number.isNaN(date.getTime()));
    }, [props]);

    const rangeValue = useMemo(() => {
      if (!isRangeProps(props) || !props.value) return undefined;
      const { from, to } = props.value;
      const parsedFrom = from ? new Date(from) : undefined;
      const parsedTo = to ? new Date(to) : undefined;
      if (parsedFrom && !Number.isNaN(parsedFrom.getTime())) {
        return {
          from: parsedFrom,
          to:
            parsedTo && !Number.isNaN(parsedTo.getTime())
              ? parsedTo
              : undefined,
        };
      }
      return undefined;
    }, [props]);

    const disabledMatchers = useMemo(() => {
      const matchers: Matcher[] = [];
      if (minDate) matchers.push({ before: startOfDay(minDate) });
      if (maxDate) matchers.push({ after: endOfDay(maxDate) });
      if (disabledDates) {
        matchers.push(
          ...(Array.isArray(disabledDates) ? disabledDates : [disabledDates]),
        );
      }
      return matchers;
    }, [disabledDates, maxDate, minDate]);

    const calendarFormatters = useMemo(() => {
      if (locale === "th") {
        return {
          formatYearDropdown: (date: Date) => {
            const year = date.getFullYear() + 543;
            return year.toString();
          },
          formatCaption: (date: Date) => {
            const year = date.getFullYear() + 543;
            const month = date.toLocaleString("th-TH", { month: "long" });
            return `${month} ${year}`;
          },
          formatWeekdayName: (date: Date) => {
            return date.toLocaleString("th-TH", { weekday: "narrow" });
          },
        };
      }
      return {};
    }, [locale]);

    const hasSelection = useMemo(() => {
      if (isSingleProps(props)) return Boolean(singleValue);
      if (isMultipleProps(props)) return multipleValues.length > 0;
      if (isRangeProps(props)) return Boolean(rangeValue);
      return false;
    }, [multipleValues.length, props, rangeValue, singleValue]);

    const displayLabel = useMemo(() => {
      if (!hasSelection) return placeholder;

      if (isSingleProps(props) && singleValue) {
        return (
          props.formatDateLabel?.(singleValue) ?? format(singleValue, "PPP")
        );
      }

      if (isMultipleProps(props) && multipleValues.length > 0) {
        return (
          props.formatDateLabel?.(multipleValues) ??
          `${multipleValues.length} date${multipleValues.length !== 1 ? "s" : ""} selected`
        );
      }

      if (isRangeProps(props) && rangeValue?.from) {
        const labelRange: { from?: Date; to?: Date } = {
          from: rangeValue.from,
        };
        if (rangeValue.to) labelRange.to = rangeValue.to;
        return (
          props.formatDateLabel?.(labelRange) ??
          `${format(rangeValue.from, "MMM d")}${
            rangeValue.to ? ` - ${format(rangeValue.to, "MMM d")}` : ""
          }`
        );
      }

      return placeholder;
    }, [
      hasSelection,
      multipleValues,
      placeholder,
      props,
      rangeValue,
      singleValue,
    ]);

    const handleClear = () => {
      if (isSingleProps(props)) {
        props.onChange("");
      } else if (isMultipleProps(props)) {
        props.onChange([]);
      } else if (isRangeProps(props)) {
        props.onChange({});
      }
    };

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            ref={ref}
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !hasSelection && "text-muted-foreground",
              hasError &&
                "border-destructive/60 focus-visible:ring-destructive/50",
              className,
            )}
            disabled={disabled}
            aria-label={ariaLabel}
            aria-invalid={hasError || undefined}
            type="button"
          >
            <CalendarIcon />
            {displayLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {isMultipleProps(props) && (
            <Calendar
              mode="multiple"
              selected={multipleValues}
              onSelect={(dates) =>
                props.onChange((dates ?? []).map((date) => formatIso(date)))
              }
              disabled={disabledMatchers.length ? disabledMatchers : undefined}
              formatters={calendarFormatters}
            />
          )}
          {isRangeProps(props) && (
            <Calendar
              mode="range"
              selected={rangeValue}
              onSelect={(range) => {
                const nextRange: { from?: string; to?: string } = {};
                if (range?.from) nextRange.from = formatIso(range.from);
                if (range?.to) nextRange.to = formatIso(range.to);
                props.onChange(nextRange);
              }}
              required
              disabled={disabledMatchers.length ? disabledMatchers : undefined}
              formatters={calendarFormatters}
            />
          )}
          {isSingleProps(props) && (
            <Calendar
              mode="single"
              selected={singleValue}
              onSelect={(date) => props.onChange(date ? formatIso(date) : "")}
              disabled={disabledMatchers.length ? disabledMatchers : undefined}
              formatters={calendarFormatters}
            />
          )}
          {hasSelection && (
            <div className="border-t p-1 text-right">
              <Button size="sm" variant="ghost" onClick={handleClear}>
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
