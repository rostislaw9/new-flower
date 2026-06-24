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
    dateFrom: string;
    dateTo: string;
    dateClearLabel: string;
  };
  locale: string;
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

  const [searchValue, setSearchValue] = useState(initialSearch);
  const [ratingValue, setRatingValue] = useState(
    initialRating ? String(initialRating) : ALL_OPTION_VALUE,
  );
  const [submittedFromValue, setSubmittedFromValue] = useState(
    initialSubmittedFrom ?? "",
  );
  const [submittedToValue, setSubmittedToValue] = useState(
    initialSubmittedTo ?? "",
  );

  const formatDateLabel = useMemo(
    () => createDateLabelFormatter(locale),
    [locale],
  );

  useEffect(() => {
    setSearchValue(initialSearch);
    setRatingValue(initialRating ? String(initialRating) : ALL_OPTION_VALUE);
    setSubmittedFromValue(initialSubmittedFrom ?? "");
    setSubmittedToValue(initialSubmittedTo ?? "");
  }, [initialSearch, initialRating, initialSubmittedFrom, initialSubmittedTo]);

  const selectOptions = useMemo(
    () => [
      { value: ALL_OPTION_VALUE, label: labels.ratingAll },
      ...ratingOptions,
    ],
    [labels.ratingAll, ratingOptions],
  );

  function buildQueryString() {
    const params = new URLSearchParams();
    params.set("page", "1");
    if (searchValue.trim()) params.set("search", searchValue.trim());
    if (ratingValue !== ALL_OPTION_VALUE) params.set("rating", ratingValue);
    if (submittedFromValue) params.set("submittedFrom", submittedFromValue);
    if (submittedToValue) params.set("submittedTo", submittedToValue);
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
    setRatingValue(ALL_OPTION_VALUE);
    setSubmittedFromValue("");
    setSubmittedToValue("");
    router.push(pathname);
    router.refresh();
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="reviews-search">{labels.searchLabel}</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="reviews-search"
              type="text"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder={labels.searchPlaceholder}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="reviews-rating">{labels.ratingLabel}</Label>
          <Select value={ratingValue} onValueChange={setRatingValue}>
            <SelectTrigger id="reviews-rating">
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
        </div>

        <div className="flex flex-col gap-2">
          <Label>{labels.submittedRangeLabel}</Label>
          <div className="grid grid-cols-2 gap-2">
            <DatePicker
              id="reviews-submitted-from"
              value={submittedFromValue}
              placeholder={labels.dateFrom}
              onChange={setSubmittedFromValue}
              clearLabel={labels.dateClearLabel}
              ariaLabel={`${labels.submittedRangeLabel} ${labels.dateFrom}`}
              formatDateLabel={formatDateLabel}
            />
            <DatePicker
              id="reviews-submitted-to"
              value={submittedToValue}
              placeholder={labels.dateTo}
              onChange={setSubmittedToValue}
              clearLabel={labels.dateClearLabel}
              ariaLabel={`${labels.submittedRangeLabel} ${labels.dateTo}`}
              formatDateLabel={formatDateLabel}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" variant="accent">
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
