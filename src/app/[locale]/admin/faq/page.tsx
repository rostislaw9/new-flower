"use client";

import { useCallback, useEffect, useState } from "react";

import { useTranslations } from "next-intl";

import {
  ChevronDown,
  ChevronRight,
  Loader2,
  MoveLeft,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/styled/Button";
import { Text } from "@/components/styled/Typography";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createFaqGroup,
  createFaqQuestion,
  deleteFaqGroup,
  deleteFaqQuestion,
  updateFaqGroup,
  updateFaqTranslation,
} from "@/lib/actions/faq";

interface FaqTranslationData {
  id: string;
  locale: string;
  questionText: string;
  answerText: string;
}

interface FaqQuestionData {
  id: string;
  displayOrder: number;
  translations: FaqTranslationData[];
}

interface FaqGroupData {
  id: string;
  title: string;
  displayOrder: number;
  questions: FaqQuestionData[];
}

export default function FaqAdminPage() {
  const t = useTranslations("admin.faq");
  const actionsT = useTranslations("admin.common.actions");

  const [groups, setGroups] = useState<FaqGroupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set(),
  );

  const fetchGroups = useCallback(async () => {
    try {
      const res = await fetch("/api/faq", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch FAQ");
      const data = (await res.json()) as FaqGroupData[];
      setGroups(data);
      if (data.length > 0) {
        setExpandedGroups(new Set([data[0]!.id]));
      }
    } catch {
      toast.error(t("error"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchGroups();
  }, [fetchGroups]);

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleQuestion = (id: string) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAddGroup = async () => {
    const result = await createFaqGroup("New Group");
    if (result.success) {
      toast.success(t("groupCreated"));
      await fetchGroups();
    } else {
      toast.error(result.message);
    }
  };

  const handleSaveGroup = async (id: string, title: string) => {
    setSaving(`group-${id}`);
    const result = await updateFaqGroup(id, title);
    if (result.success) {
      toast.success(t("groupSaved"));
      await fetchGroups();
    } else {
      toast.error(result.message);
    }
    setSaving(null);
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm(t("groupDeleteConfirm"))) return;
    const result = await deleteFaqGroup(id);
    if (result.success) {
      toast.success(t("groupDeleted"));
      await fetchGroups();
    } else {
      toast.error(result.message);
    }
  };

  const handleAddQuestion = async (groupId: string) => {
    const result = await createFaqQuestion(groupId);
    if (result.success) {
      toast.success(t("questionCreated"));
      await fetchGroups();
      setExpandedGroups((prev) => new Set(prev).add(groupId));
    } else {
      toast.error(result.message);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm(t("questionDeleteConfirm"))) return;
    const result = await deleteFaqQuestion(id);
    if (result.success) {
      toast.success(t("questionDeleted"));
      await fetchGroups();
    } else {
      toast.error(result.message);
    }
  };

  const handleSaveTranslation = async (
    questionId: string,
    locale: string,
    questionText: string,
    answerText: string,
  ) => {
    setSaving(`translation-${questionId}-${locale}`);
    const result = await updateFaqTranslation(
      questionId,
      locale,
      questionText,
      answerText,
    );
    if (result.success) {
      toast.success(t("translationSaved"));
    } else {
      toast.error(result.message);
    }
    setSaving(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin" />
        <Text muted>{actionsT("loading")}</Text>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              href="/admin"
              variant="outline"
              className="flex items-center gap-2"
            >
              <MoveLeft />
              {actionsT("back")}
            </Button>
            <Button
              size="sm"
              variant="accent"
              onClick={handleAddGroup}
              className="flex items-center gap-2"
            >
              <Plus />
              {t("addGroup")}
            </Button>
          </div>
        }
      />

      {groups.length === 0 ? (
        <Card className="rounded-2xl border border-border/60 bg-card/60 shadow-lg">
          <CardContent className="py-12 text-center">
            <Text muted>{t("empty")}</Text>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((group) => {
            const isExpanded = expandedGroups.has(group.id);
            return (
              <Card
                key={group.id}
                className="rounded-2xl border border-border/60 bg-card/60 shadow-lg"
              >
                <CardContent className="p-4">
                  {/* Group header */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.id)}
                      className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    <Input
                      defaultValue={group.title}
                      onBlur={(e) => {
                        if (e.target.value !== group.title) {
                          void handleSaveGroup(group.id, e.target.value);
                        }
                      }}
                      className="flex-1 font-medium"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => void handleDeleteGroup(group.id)}
                      aria-label={actionsT("delete")}
                      className="hover:border-destructive/40 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 flex flex-col gap-3 pl-6">
                      {group.questions.map((question) => {
                        const isQExpanded = expandedQuestions.has(question.id);
                        const enTranslation = question.translations.find(
                          (tr) => tr.locale === "en",
                        );
                        const thTranslation = question.translations.find(
                          (tr) => tr.locale === "th",
                        );

                        return (
                          <div
                            key={question.id}
                            className="rounded-lg border border-border/40"
                          >
                            {/* Question header */}
                            <div className="flex items-center gap-2 p-3">
                              <button
                                type="button"
                                onClick={() => toggleQuestion(question.id)}
                                className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                              >
                                {isQExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </button>
                              <Text
                                size="sm"
                                className="flex-1 truncate font-medium"
                              >
                                {enTranslation?.questionText ||
                                  t("untitledQuestion")}
                              </Text>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() =>
                                  void handleDeleteQuestion(question.id)
                                }
                                aria-label={actionsT("delete")}
                                className="h-7 w-7 hover:border-destructive/40 hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>

                            {isQExpanded && (
                              <div className="flex flex-col gap-4 p-3 pt-0">
                                {/* English translation */}
                                <TranslationEditor
                                  label="EN"
                                  initialQuestion={
                                    enTranslation?.questionText ?? ""
                                  }
                                  initialAnswer={
                                    enTranslation?.answerText ?? ""
                                  }
                                  questionLabel={t("questionLabel")}
                                  answerLabel={t("answerLabel")}
                                  saveLabel={actionsT("save")}
                                  saving={
                                    saving === `translation-${question.id}-en`
                                  }
                                  onSave={(q, a) =>
                                    void handleSaveTranslation(
                                      question.id,
                                      "en",
                                      q,
                                      a,
                                    )
                                  }
                                />

                                {/* Thai translation */}
                                <TranslationEditor
                                  label="TH"
                                  initialQuestion={
                                    thTranslation?.questionText ?? ""
                                  }
                                  initialAnswer={
                                    thTranslation?.answerText ?? ""
                                  }
                                  questionLabel={t("questionLabel")}
                                  answerLabel={t("answerLabel")}
                                  saveLabel={actionsT("save")}
                                  saving={
                                    saving === `translation-${question.id}-th`
                                  }
                                  onSave={(q, a) =>
                                    void handleSaveTranslation(
                                      question.id,
                                      "th",
                                      q,
                                      a,
                                    )
                                  }
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void handleAddQuestion(group.id)}
                        className="flex items-center gap-2 self-start"
                      >
                        <Plus className="h-4 w-4" />
                        {t("addQuestion")}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TranslationEditor({
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

  const hasChanges = question !== initialQuestion || answer !== initialAnswer;

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border/30 bg-muted/20 p-3">
      <div className="flex items-center gap-2">
        <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
          {label}
        </span>
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
      {hasChanges && (
        <Button
          size="sm"
          variant="accent"
          disabled={saving}
          onClick={() => onSave(question, answer)}
          className="flex items-center gap-2 self-start"
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          {saveLabel}
        </Button>
      )}
    </div>
  );
}
