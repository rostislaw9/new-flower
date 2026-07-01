"use client";

import { useEffect, useMemo } from "react";
import { type Control, Controller, useForm } from "react-hook-form";

import { usePathname, useRouter } from "next/navigation";

import { Filter, Search } from "lucide-react";

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

interface StatusOption {
  value: string;
  label: string;
}

type DateRangeValue = { from?: string; to?: string };

interface BookingsFiltersProps {
  initialValues: {
    search?: string;
    status?: string;
    bookingId?: string;
    submittedFrom?: string;
    submittedTo?: string;
    updatedFrom?: string;
    updatedTo?: string;
    preferredFrom?: string;
    preferredTo?: string;
  };
  statusOptions: StatusOption[];
  labels: {
    searchLabel: string;
    searchPlaceholder: string;
    statusLabel: string;
    bookingIdLabel: string;
    bookingIdPlaceholder: string;
    submittedRangeLabel: string;
    updatedRangeLabel: string;
    preferredRangeLabel: string;
    datePickerPlaceholder: string;
    datePickerClearLabel: string;
    filter: string;
    clear: string;
  };
  locale: string;
}

interface FiltersFormValues {
  search: string;
  status: string;
  bookingId: string;
  submittedRange: DateRangeValue;
  updatedRange: DateRangeValue;
  preferredRange: DateRangeValue;
}

export function BookingsFilters({
  initialValues,
  statusOptions,
  labels,
  locale,
}: BookingsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  const defaultValues = useMemo<FiltersFormValues>(
    () => ({
      search: initialValues.search ?? "",
      status: initialValues.status ?? "all",
      bookingId: initialValues.bookingId ?? "",
      submittedRange: {
        ...(initialValues.submittedFrom && {
          from: initialValues.submittedFrom,
        }),
        ...(initialValues.submittedTo && { to: initialValues.submittedTo }),
      },
      updatedRange: {
        ...(initialValues.updatedFrom && { from: initialValues.updatedFrom }),
        ...(initialValues.updatedTo && { to: initialValues.updatedTo }),
      },
      preferredRange: {
        ...(initialValues.preferredFrom && {
          from: initialValues.preferredFrom,
        }),
        ...(initialValues.preferredTo && { to: initialValues.preferredTo }),
      },
    }),
    [initialValues],
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

  function buildQueryString(values: FiltersFormValues) {
    const params = new URLSearchParams();
    params.set("page", "1");
    if (values.search.trim()) params.set("search", values.search.trim());
    if (values.status !== "all") params.set("status", values.status);
    if (values.bookingId.trim())
      params.set("bookingId", values.bookingId.trim());
    if (values.submittedRange.from)
      params.set("submittedFrom", values.submittedRange.from);
    if (values.submittedRange.to)
      params.set("submittedTo", values.submittedRange.to);
    if (values.updatedRange.from)
      params.set("updatedFrom", values.updatedRange.from);
    if (values.updatedRange.to) params.set("updatedTo", values.updatedRange.to);
    if (values.preferredRange.from)
      params.set("preferredFrom", values.preferredRange.from);
    if (values.preferredRange.to)
      params.set("preferredTo", values.preferredRange.to);
    return params.toString();
  }

  const onSubmit = form.handleSubmit((values) => {
    const query = buildQueryString(values);
    router.push(query ? `${pathname}?${query}` : pathname);
    router.refresh();
  });

  function handleClear() {
    form.reset({
      search: "",
      status: "all",
      bookingId: "",
      submittedRange: {},
      updatedRange: {},
      preferredRange: {},
    });
    router.push(pathname);
    router.refresh();
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
                <FieldLabel htmlFor="booking-search">
                  {labels.searchLabel}
                </FieldLabel>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="booking-search"
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
          name="bookingId"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldContent>
                <FieldLabel htmlFor="booking-id">
                  {labels.bookingIdLabel}
                </FieldLabel>
                <Input
                  id="booking-id"
                  type="text"
                  placeholder={labels.bookingIdPlaceholder}
                  {...field}
                />
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          control={control}
          name="status"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldContent>
                <FieldLabel>{labels.statusLabel}</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder={labels.statusLabel} />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
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

        <DateRangeFilterField
          control={control}
          name="preferredRange"
          label={labels.preferredRangeLabel}
          inputId="preferred-range"
          placeholder={labels.datePickerPlaceholder}
          clearLabel={labels.datePickerClearLabel}
          locale={locale}
          formatDateLabel={formatRangeLabel}
        />
        <DateRangeFilterField
          control={control}
          name="submittedRange"
          label={labels.submittedRangeLabel}
          inputId="submitted-range"
          placeholder={labels.datePickerPlaceholder}
          clearLabel={labels.datePickerClearLabel}
          locale={locale}
          formatDateLabel={formatRangeLabel}
        />
        <DateRangeFilterField
          control={control}
          name="updatedRange"
          label={labels.updatedRangeLabel}
          inputId="updated-range"
          placeholder={labels.datePickerPlaceholder}
          clearLabel={labels.datePickerClearLabel}
          locale={locale}
          formatDateLabel={formatRangeLabel}
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" variant="accent" className="w-full md:w-auto">
          <Filter />
          {labels.filter}
        </Button>
        <Button type="button" variant="outline" onClick={handleClear}>
          {labels.clear}
        </Button>
      </div>
    </form>
  );
}

interface DateRangeFilterFieldProps {
  control: Control<FiltersFormValues>;
  name: keyof Pick<
    FiltersFormValues,
    "preferredRange" | "submittedRange" | "updatedRange"
  >;
  label: string;
  inputId: string;
  placeholder: string;
  clearLabel: string;
  locale: string;
  formatDateLabel: (range: { from?: Date; to?: Date }) => string;
}

function DateRangeFilterField({
  control,
  name,
  label,
  inputId,
  placeholder,
  clearLabel,
  locale,
  formatDateLabel,
}: DateRangeFilterFieldProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldContent>
            <FieldLabel>{label}</FieldLabel>
            <DatePicker
              id={inputId}
              mode="range"
              value={field.value ?? {}}
              onChange={(value) => field.onChange(value ?? {})}
              placeholder={placeholder}
              clearLabel={clearLabel}
              ariaLabel={label}
              locale={locale}
              formatDateLabel={formatDateLabel}
            />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </FieldContent>
        </Field>
      )}
    />
  );
}
