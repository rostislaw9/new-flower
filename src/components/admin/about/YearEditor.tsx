"use client";

import { useEffect, useState } from "react";

import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/styled/Button";
import { Input } from "@/components/ui/input";

export function YearEditor({
  initialYear,
  yearLabel,
  buddhistYearLabel,
  saveLabel,
  saving,
  onSave,
}: {
  initialYear: string;
  yearLabel: string;
  buddhistYearLabel: string;
  saveLabel: string;
  saving: boolean;
  onSave: (year: string) => void;
}) {
  const [year, setYear] = useState(initialYear);

  useEffect(() => {
    setYear(initialYear);
  }, [initialYear]);

  const hasChanges = year !== initialYear;

  const buddhistYear =
    year && /^\d+$/.test(year.trim())
      ? (parseInt(year.trim()) + 543).toString()
      : "";

  return (
    <div className="flex w-full max-w-md flex-col gap-2 rounded-md border border-border/30 bg-muted/20 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded bg-primary/10 p-2 text-xs font-semibold text-primary">
          {yearLabel}
        </span>
        {hasChanges && (
          <Button
            size="sm"
            variant="accent"
            disabled={saving}
            onClick={() => {
              const trimmed = year.trim();
              setYear(trimmed);
              onSave(trimmed);
            }}
          >
            {saving ? <Loader2 className="animate-spin" /> : <Save />}
            {saveLabel}
          </Button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">{yearLabel}</label>
          <Input
            value={year}
            onChange={(e) => setYear(e.target.value)}
            disabled={saving}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">
            {buddhistYearLabel}
          </label>
          <Input value={buddhistYear} disabled />
        </div>
      </div>
    </div>
  );
}
