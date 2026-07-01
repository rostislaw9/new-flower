"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";

import { usePathname, useRouter } from "next/navigation";

import { Filter, Search } from "lucide-react";

import { useDrawerClose } from "@/components/admin/AdminFiltersShell";
import { Button } from "@/components/styled/Button";
import { DatePicker } from "@/components/styled/DatePicker";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createDateLabelFormatter } from "@/lib/date-utils";

const ALL_OPTION_VALUE = "all";

interface RatingOption {
  value: string;
  label: string;
}

interface ReviewsFiltersProps {
  initialSearch: string;
  initialRating?: number;
  initialSubmittedFrom?: string;
  initialSubmittedTo?: string;
  ratingOptions: RatingOption[];
  labels: {
    searchLabel: string;
    searchPlaceholder: string;
    ratingLabel: string;
    ratingAll: string;
    apply: string;
    clear: string;
    submittedRangeLabel: string;
    datePickerPlaceholder: string;
    datePickerClearLabel: string;
  };
  locale: string;
}

interface FiltersFormValues {
  search: string;
  rating: string;
  submittedRange: {
    from?: string;
    to?: string;
  };
}

export function ReviewsFilters({
  initialSearch,
  initialRating,
  initialSubmittedFrom,
  initialSubmittedTo,
  ratingOptions,
  labels,
  locale,
}: ReviewsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const closeDrawer = useDrawerClose();

  const defaultValues = useMemo<FiltersFormValues>(
    () => ({
      search: initialSearch ?? "",
      rating: initialRating ? String(initialRating) : ALL_OPTION_VALUE,
      submittedRange: {
        ...(initialSubmittedFrom && { from: initialSubmittedFrom }),
        ...(initialSubmittedTo && { to: initialSubmittedTo }),
      },
    }),
    [initialRating, initialSearch, initialSubmittedFrom, initialSubmittedTo],
  );

  const form = useForm<FiltersFormValues>({
    defaultValues,
  });

  const { control } = form;

  const formatDateLabel = useMemo(
    () => createDateLabelFormatter(locale),
    [locale],
  );

  const formatRangeLabel = (range: { from?: Date; to?: Date }) => {
    if (!range.from) return "";
    return range.to
      ? `${formatDateLabel(range.from)} - ${formatDateLabel(range.to)}`
      : formatDateLabel(range.from);
  };

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const selectOptions = useMemo(
    () => [
      { value: ALL_OPTION_VALUE, label: labels.ratingAll },
      ...ratingOptions,
    ],
    [labels.ratingAll, ratingOptions],
  );

  function buildQueryString(values: FiltersFormValues) {
    const params = new URLSearchParams();
    params.set("page", "1");
    if (values.search.trim()) params.set("search", values.search.trim());
    if (values.rating !== ALL_OPTION_VALUE) params.set("rating", values.rating);
    if (values.submittedRange.from)
      params.set("submittedFrom", values.submittedRange.from);
    if (values.submittedRange.to)
      params.set("submittedTo", values.submittedRange.to);
    return params.toString();
  }

  const onSubmit = form.handleSubmit((values) => {
    const query = buildQueryString(values);
    router.push(query ? `${pathname}?${query}` : pathname);
    router.refresh();
    closeDrawer?.();
  });

  function handleClear() {
    form.reset({
      search: "",
      rating: ALL_OPTION_VALUE,
      submittedRange: {},
    });
    router.push(pathname);
    router.refresh();
    closeDrawer?.();
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-3">
        <Controller
          control={control}
          name="search"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldContent>
                <FieldLabel htmlFor="reviews-search">
                  {labels.searchLabel}
                </FieldLabel>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="reviews-search"
                    type="text"
                    placeholder={labels.searchPlaceholder}
                    className="pl-10"
                    {...field}
                  />
                </div>
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          control={control}
          name="rating"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldContent>
                <FieldLabel htmlFor="reviews-rating">
                  {labels.ratingLabel}
                </FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="reviews-rating"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder={labels.ratingAll} />
                  </SelectTrigger>
                  <SelectContent>
                    {selectOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          control={control}
          name="submittedRange"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldContent>
                <FieldLabel>{labels.submittedRangeLabel}</FieldLabel>
                <DatePicker
                  id="reviews-submitted-range"
                  mode="range"
                  value={field.value ?? {}}
                  onChange={(value) => field.onChange(value ?? {})}
                  placeholder={labels.datePickerPlaceholder}
                  clearLabel={labels.datePickerClearLabel}
                  ariaLabel={labels.submittedRangeLabel}
                  locale={locale}
                  formatDateLabel={formatRangeLabel}
                />
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
            </Field>
          )}
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" variant="accent" className="w-full md:w-auto">
          <Filter />
          {labels.apply}
        </Button>
        <Button type="button" variant="outline" onClick={handleClear}>
          {labels.clear}
        </Button>
      </div>
    </form>
  );
}
