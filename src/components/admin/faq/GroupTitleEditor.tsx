"use client";

import { useEffect, useState } from "react";

import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/styled/Button";
import { Input } from "@/components/ui/input";

export function GroupTitleEditor({
  label,
  initialTitle,
  titleLabel,
  saveLabel,
  saving,
  onSave,
}: {
  label: string;
  initialTitle: string;
  titleLabel: string;
  saveLabel: string;
  saving: boolean;
  onSave: (title: string) => void;
}) {
  const [title, setTitle] = useState(initialTitle);

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);

  const hasChanges = title !== initialTitle;

  return (
    <div className="flex w-full flex-col gap-2 rounded-lg border border-border/30 bg-muted/20 p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded bg-primary/10 p-2 text-xs font-semibold text-primary">
          {label}
        </span>
        {hasChanges && (
          <Button
            size="sm"
            variant="accent"
            disabled={saving}
            onClick={() => {
              const trimmed = title.trim();
              setTitle(trimmed);
              onSave(trimmed);
            }}
          >
            {saving ? <Loader2 className="animate-spin" /> : <Save />}
            {saveLabel}
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">{titleLabel}</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
    </div>
  );
}
