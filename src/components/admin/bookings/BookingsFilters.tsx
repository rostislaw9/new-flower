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
    dateFrom: string;
    dateTo: string;
    dateClearLabel: string;
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
  const [submittedFromValue, setSubmittedFromValue] = useState(
    initialValues.submittedFrom ?? "",
  );
  const [submittedToValue, setSubmittedToValue] = useState(
    initialValues.submittedTo ?? "",
  );
  const [updatedFromValue, setUpdatedFromValue] = useState(
    initialValues.updatedFrom ?? "",
  );
  const [updatedToValue, setUpdatedToValue] = useState(
    initialValues.updatedTo ?? "",
  );
  const [preferredFromValue, setPreferredFromValue] = useState(
    initialValues.preferredFrom ?? "",
  );
  const [preferredToValue, setPreferredToValue] = useState(
    initialValues.preferredTo ?? "",
  );

  const formatDateLabel = useMemo(
    () => createDateLabelFormatter(locale),
    [locale],
  );

  useEffect(() => {
    setSearchValue(initialValues.search ?? "");
    setStatusValue(initialValues.status ?? "all");
    setBookingIdValue(initialValues.bookingId ?? "");
    setSubmittedFromValue(initialValues.submittedFrom ?? "");
    setSubmittedToValue(initialValues.submittedTo ?? "");
    setUpdatedFromValue(initialValues.updatedFrom ?? "");
    setUpdatedToValue(initialValues.updatedTo ?? "");
    setPreferredFromValue(initialValues.preferredFrom ?? "");
    setPreferredToValue(initialValues.preferredTo ?? "");
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
    if (submittedFromValue) params.set("submittedFrom", submittedFromValue);
    if (submittedToValue) params.set("submittedTo", submittedToValue);
    if (updatedFromValue) params.set("updatedFrom", updatedFromValue);
    if (updatedToValue) params.set("updatedTo", updatedToValue);
    if (preferredFromValue) params.set("preferredFrom", preferredFromValue);
    if (preferredToValue) params.set("preferredTo", preferredToValue);
    return params.toString();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = buildQueryString();
    router.push(query ? `${pathname}?${query}` : pathname);
    router.refresh();
  }

  function handleClear() {
    setSearchValue("");
    setStatusValue("all");
    setBookingIdValue("");
    setSubmittedFromValue("");
    setSubmittedToValue("");
    setUpdatedFromValue("");
    setUpdatedToValue("");
    setPreferredFromValue("");
    setPreferredToValue("");
    router.push(pathname);
    router.refresh();
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
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
        <div className="space-y-2">
          <Label htmlFor="booking-id">{labels.bookingIdLabel}</Label>
          <Input
            id="booking-id"
            type="text"
            value={bookingIdValue}
            onChange={(event) => setBookingIdValue(event.target.value)}
            placeholder={labels.bookingIdPlaceholder}
          />
        </div>
        <div className="space-y-2">
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
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <DateRangeField
          label={labels.submittedRangeLabel}
          fromId="submitted-from"
          toId="submitted-to"
          fromPlaceholder={labels.dateFrom}
          toPlaceholder={labels.dateTo}
          fromValue={submittedFromValue}
          toValue={submittedToValue}
          onFromChange={setSubmittedFromValue}
          onToChange={setSubmittedToValue}
          clearLabel={labels.dateClearLabel}
          formatDateLabel={formatDateLabel}
        />
        <DateRangeField
          label={labels.updatedRangeLabel}
          fromId="updated-from"
          toId="updated-to"
          fromPlaceholder={labels.dateFrom}
          toPlaceholder={labels.dateTo}
          fromValue={updatedFromValue}
          toValue={updatedToValue}
          onFromChange={setUpdatedFromValue}
          onToChange={setUpdatedToValue}
          clearLabel={labels.dateClearLabel}
          formatDateLabel={formatDateLabel}
        />
        <DateRangeField
          label={labels.preferredRangeLabel}
          fromId="preferred-from"
          toId="preferred-to"
          fromPlaceholder={labels.dateFrom}
          toPlaceholder={labels.dateTo}
          fromValue={preferredFromValue}
          toValue={preferredToValue}
          onFromChange={setPreferredFromValue}
          onToChange={setPreferredToValue}
          clearLabel={labels.dateClearLabel}
          formatDateLabel={formatDateLabel}
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" variant="accent">
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
  fromId: string;
  toId: string;
  fromPlaceholder: string;
  toPlaceholder: string;
  fromValue: string;
  toValue: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  clearLabel: string;
  formatDateLabel: (date: Date) => string;
}

function DateRangeField({
  label,
  fromId,
  toId,
  fromPlaceholder,
  toPlaceholder,
  fromValue,
  toValue,
  onFromChange,
  onToChange,
  clearLabel,
  formatDateLabel,
}: DateRangeFieldProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="grid gap-4 sm:grid-cols-2">
        <DatePicker
          id={fromId}
          value={fromValue}
          placeholder={fromPlaceholder}
          onChange={onFromChange}
          clearLabel={clearLabel}
          ariaLabel={`${label} ${fromPlaceholder}`}
          formatDateLabel={formatDateLabel}
        />
        <DatePicker
          id={toId}
          value={toValue}
          placeholder={toPlaceholder}
          onChange={onToChange}
          clearLabel={clearLabel}
          ariaLabel={`${label} ${toPlaceholder}`}
          formatDateLabel={formatDateLabel}
        />
      </div>
    </div>
  );
}
