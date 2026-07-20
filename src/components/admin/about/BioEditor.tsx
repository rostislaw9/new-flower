"use client";

import { useEffect, useState } from "react";

import { LoaderCircle, Save } from "lucide-react";

import { Button } from "@/components/styled/Button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function BioEditor({
  label,
  initialTitle,
  initialDescription,
  titleLabel,
  descriptionLabel,
  saveLabel,
  saving,
  onSave,
}: {
  label: string;
  initialTitle: string;
  initialDescription: string;
  titleLabel: string;
  descriptionLabel: string;
  saveLabel: string;
  saving: boolean;
  onSave: (title: string, description: string) => void;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);

  useEffect(() => {
    setTitle(initialTitle);
    setDescription(initialDescription);
  }, [initialTitle, initialDescription]);

  const hasChanges =
    title !== initialTitle || description !== initialDescription;

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
              const trimmedT = title.trim();
              const trimmedD = description.trim();
              setTitle(trimmedT);
              setDescription(trimmedD);
              onSave(trimmedT, trimmedD);
            }}
          >
            {saving ? <LoaderCircle className="animate-spin" /> : <Save />}
            {saveLabel}
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">{titleLabel}</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">
          {descriptionLabel}
        </label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={10}
        />
      </div>
    </div>
  );
}
