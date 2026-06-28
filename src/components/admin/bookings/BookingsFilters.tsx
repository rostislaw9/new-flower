"use client";

import { useEffect, useMemo, useState } from "react";

import { usePathname, useRouter } from "next/navigation";

import { Filter, Search } from "lucide-react";

import { Button } from "@/components/styled/Button";
import { DatePicker } from "@/components/styled/DatePicker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export function BookingsFilters({
  initialValues,
  statusOptions,
  labels,
  locale,
}: BookingsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [searchValue, setSearchValue] = useState(initialValues.search ?? "");
  const [statusValue, setStatusValue] = useState(initialValues.status ?? "all");
  const [bookingIdValue, setBookingIdValue] = useState(
    initialValues.bookingId ?? "",
  );
  const [submittedRange, setSubmittedRange] = useState<{
    from?: string;
    to?: string;
  }>({
    ...(initialValues.submittedFrom && { from: initialValues.submittedFrom }),
    ...(initialValues.submittedTo && { to: initialValues.submittedTo }),
  });
  const [updatedRange, setUpdatedRange] = useState<{
    from?: string;
    to?: string;
  }>({
    ...(initialValues.updatedFrom && { from: initialValues.updatedFrom }),
    ...(initialValues.updatedTo && { to: initialValues.updatedTo }),
  });
  const [preferredRange, setPreferredRange] = useState<{
    from?: string;
    to?: string;
  }>({
    ...(initialValues.preferredFrom && { from: initialValues.preferredFrom }),
    ...(initialValues.preferredTo && { to: initialValues.preferredTo }),
  });

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
    setSearchValue(initialValues.search ?? "");
    setStatusValue(initialValues.status ?? "all");
    setBookingIdValue(initialValues.bookingId ?? "");
    setSubmittedRange({
      ...(initialValues.submittedFrom && { from: initialValues.submittedFrom }),
      ...(initialValues.submittedTo && { to: initialValues.submittedTo }),
    });
    setUpdatedRange({
      ...(initialValues.updatedFrom && { from: initialValues.updatedFrom }),
      ...(initialValues.updatedTo && { to: initialValues.updatedTo }),
    });
    setPreferredRange({
      ...(initialValues.preferredFrom && { from: initialValues.preferredFrom }),
      ...(initialValues.preferredTo && { to: initialValues.preferredTo }),
    });
  }, [
    initialValues.search,
    initialValues.status,
    initialValues.bookingId,
    initialValues.submittedFrom,
    initialValues.submittedTo,
    initialValues.updatedFrom,
    initialValues.updatedTo,
    initialValues.preferredFrom,
    initialValues.preferredTo,
  ]);

  function buildQueryString() {
    const params = new URLSearchParams();
    params.set("page", "1");
    if (searchValue.trim()) params.set("search", searchValue.trim());
    if (statusValue !== "all") params.set("status", statusValue);
    if (bookingIdValue.trim()) params.set("bookingId", bookingIdValue.trim());
    if (submittedRange.from) params.set("submittedFrom", submittedRange.from);
    if (submittedRange.to) params.set("submittedTo", submittedRange.to);
    if (updatedRange.from) params.set("updatedFrom", updatedRange.from);
    if (updatedRange.to) params.set("updatedTo", updatedRange.to);
    if (preferredRange.from) params.set("preferredFrom", preferredRange.from);
    if (preferredRange.to) params.set("preferredTo", preferredRange.to);
    return params.toString();
  }

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = buildQueryString();
    router.push(query ? `${pathname}?${query}` : pathname);
    router.refresh();
  }

  function handleClear() {
    setSearchValue("");
    setStatusValue("all");
    setBookingIdValue("");
    setSubmittedRange({});
    setUpdatedRange({});
    setPreferredRange({});
    router.push(pathname);
    router.refresh();
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="booking-search">{labels.searchLabel}</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="booking-search"
              type="text"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder={labels.searchPlaceholder}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="booking-id">{labels.bookingIdLabel}</Label>
          <Input
            id="booking-id"
            type="text"
            value={bookingIdValue}
            onChange={(event) => setBookingIdValue(event.target.value)}
            placeholder={labels.bookingIdPlaceholder}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>{labels.statusLabel}</Label>
          <Select value={statusValue} onValueChange={setStatusValue}>
            <SelectTrigger>
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
        </div>
        <DateRangeField
          label={labels.preferredRangeLabel}
          id="preferred-range"
          value={preferredRange}
          onChange={setPreferredRange}
          placeholder={labels.datePickerPlaceholder}
          clearLabel={labels.datePickerClearLabel}
          formatDateLabel={formatRangeLabel}
          locale={locale}
        />
        <DateRangeField
          label={labels.submittedRangeLabel}
          id="submitted-range"
          value={submittedRange}
          onChange={setSubmittedRange}
          placeholder={labels.datePickerPlaceholder}
          clearLabel={labels.datePickerClearLabel}
          formatDateLabel={formatRangeLabel}
          locale={locale}
        />
        <DateRangeField
          label={labels.updatedRangeLabel}
          id="updated-range"
          value={updatedRange}
          onChange={setUpdatedRange}
          placeholder={labels.datePickerPlaceholder}
          clearLabel={labels.datePickerClearLabel}
          formatDateLabel={formatRangeLabel}
          locale={locale}
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

interface DateRangeFieldProps {
  label: string;
  id: string;
  value?: { from?: string; to?: string };
  onChange: (value: { from?: string; to?: string }) => void;
  placeholder: string;
  clearLabel: string;
  formatDateLabel: (range: { from?: Date; to?: Date }) => string;
  locale: string;
}

function DateRangeField({
  label,
  id,
  value,
  onChange,
  placeholder,
  clearLabel,
  formatDateLabel,
  locale,
}: DateRangeFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <DatePicker
        id={id}
        mode="range"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        clearLabel={clearLabel}
        ariaLabel={label}
        locale={locale}
        formatDateLabel={formatDateLabel}
      />
    </div>
  );
}
