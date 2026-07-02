"use client";

import { useEffect, useState } from "react";

import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/styled/Button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function TranslationEditor({
  label,
  initialQuestion,
  initialAnswer,
  questionLabel,
  answerLabel,
  saveLabel,
  saving,
  onSave,
}: {
  label: string;
  initialQuestion: string;
  initialAnswer: string;
  questionLabel: string;
  answerLabel: string;
  saveLabel: string;
  saving: boolean;
  onSave: (question: string, answer: string) => void;
}) {
  const [question, setQuestion] = useState(initialQuestion);
  const [answer, setAnswer] = useState(initialAnswer);

  useEffect(() => {
    setQuestion(initialQuestion);
    setAnswer(initialAnswer);
  }, [initialQuestion, initialAnswer]);

  const hasChanges = question !== initialQuestion || answer !== initialAnswer;

  return (
    <div className="flex w-full flex-col gap-2 rounded-md border border-border/30 bg-muted/20 p-3">
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
              const trimmedQ = question.trim();
              const trimmedA = answer.trim();
              setQuestion(trimmedQ);
              setAnswer(trimmedA);
              onSave(trimmedQ, trimmedA);
            }}
          >
            {saving ? <Loader2 className="animate-spin" /> : <Save />}
            {saveLabel}
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">{questionLabel}</label>
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="text-sm"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">{answerLabel}</label>
        <Textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={3}
          className="text-sm"
        />
      </div>
    </div>
  );
}
