"use client";

import { useCallback, useEffect, useState } from "react";

import { useLocale, useTranslations } from "next-intl";

import { ChevronDown, Loader2, MoveLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { GroupTitleEditor } from "@/components/admin/faq/GroupTitleEditor";
import { TranslationEditor } from "@/components/admin/faq/TranslationEditor";
import { Button } from "@/components/styled/Button";
import { DeleteConfirmDialog } from "@/components/styled/DeleteConfirmDialog";
import { Eyebrow, Heading, Text } from "@/components/styled/Typography";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { type Locale, defaultLocale } from "@/i18n/config";
import {
  createFaqGroup,
  createFaqQuestion,
  deleteFaqGroup,
  deleteFaqQuestion,
  updateFaqGroupTitle,
  updateFaqTranslation,
} from "@/lib/actions/faq";
import { getLocalizedPath, isSupportedLocale } from "@/lib/locale-utils";
import { cn } from "@/lib/utils";

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

interface FaqGroupTranslationData {
  id: string;
  locale: string;
  title: string;
}

interface FaqGroupData {
  id: string;
  displayOrder: number;
  translations: FaqGroupTranslationData[];
  questions: FaqQuestionData[];
}

export default function FaqAdminPage() {
  const rawLocale = useLocale();
  const locale: Locale = isSupportedLocale(rawLocale)
    ? rawLocale
    : defaultLocale;
  const t = useTranslations("admin.faq");
  const actionsT = useTranslations("admin.common.actions");

  const backHref = getLocalizedPath("/admin", locale);

  const [groups, setGroups] = useState<FaqGroupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<
    { type: "group"; id: string } | { type: "question"; id: string } | null
  >(null);

  const fetchGroups = useCallback(async () => {
    try {
      const res = await fetch("/api/faq", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch FAQ");
      const data = (await res.json()) as FaqGroupData[];
      setGroups(data);
    } catch {
      toast.error(t("error"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchGroups();
  }, [fetchGroups]);

  const handleAddGroup = async () => {
    const result = await createFaqGroup("New Group", "กลุ่มใหม่");
    if (result.success && result.id) {
      toast.success(t("groupCreated"));
      await fetchGroups();
      setExpandedGroupId(result.id);
      setExpandedQuestionId(null);
      requestAnimationFrame(() => {
        document
          .getElementById(`faq-group-${result.id}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    } else if (result.success) {
      toast.success(t("groupCreated"));
      await fetchGroups();
    } else {
      toast.error(result.message);
    }
  };

  const handleSaveGroupTitle = async (
    groupId: string,
    locale: string,
    title: string,
  ) => {
    setSaving(`group-${groupId}-${locale}`);
    const result = await updateFaqGroupTitle(groupId, locale, title);
    if (result.success) {
      toast.success(t("groupSaved"));
      await fetchGroups();
    } else {
      toast.error(result.message);
    }
    setSaving(null);
  };

  const handleDeleteGroup = async (id: string) => {
    const result = await deleteFaqGroup(id);
    if (result.success) {
      toast.success(t("groupDeleted"));
      setExpandedGroupId(null);
      await fetchGroups();
    } else {
      toast.error(result.message);
    }
  };

  const handleAddQuestion = async (groupId: string) => {
    const result = await createFaqQuestion(groupId);
    if (result.success && result.id) {
      toast.success(t("questionCreated"));
      await fetchGroups();
      setExpandedGroupId(groupId);
      setExpandedQuestionId(result.id);
      requestAnimationFrame(() => {
        document
          .getElementById(`faq-question-${result.id}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    } else if (result.success) {
      toast.success(t("questionCreated"));
      await fetchGroups();
      setExpandedGroupId(groupId);
    } else {
      toast.error(result.message);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    const result = await deleteFaqQuestion(id);
    if (result.success) {
      toast.success(t("questionDeleted"));
      setExpandedQuestionId(null);
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
      await fetchGroups();
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
              href={backHref}
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
        <Empty className="rounded-xl border">
          <EmptyHeader>
            <EmptyTitle>
              <Heading size="sm" serif={false}>
                {t("empty.title")}
              </Heading>
            </EmptyTitle>
          </EmptyHeader>
          <EmptyContent>
            <Text muted>{t("empty.description")}</Text>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((group) => {
            const isExpanded = expandedGroupId === group.id;
            const enTitle = group.translations.find((tr) => tr.locale === "en");
            const thTitle = group.translations.find((tr) => tr.locale === "th");
            const displayTitle =
              (locale === "th" ? thTitle?.title : enTitle?.title) ||
              enTitle?.title ||
              t("untitledGroup");

            return (
              <Collapsible
                key={group.id}
                id={`faq-group-${group.id}`}
                open={isExpanded}
                onOpenChange={(open) => {
                  setExpandedGroupId(open ? group.id : null);
                  setExpandedQuestionId(null);
                }}
              >
                <Card className="rounded-2xl border border-border/60 bg-card/60 shadow-md">
                  <CardContent className="p-4">
                    {/* Group header */}
                    <div className="flex items-center justify-between gap-2">
                      <CollapsibleTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          className="flex flex-1 p-2"
                        >
                          <ChevronDown
                            className={cn(
                              "transition-transform",
                              isExpanded || "-rotate-90",
                            )}
                          />
                          <Eyebrow size="xs" className="flex-1 text-left">
                            {displayTitle}
                          </Eyebrow>
                        </Button>
                      </CollapsibleTrigger>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() =>
                          setDeleteTarget({ type: "group", id: group.id })
                        }
                        aria-label={t("delete")}
                      >
                        <Trash2 />
                      </Button>
                    </div>

                    <CollapsibleContent>
                      <div className="mt-4 flex flex-col gap-4">
                        {/* Group title editors */}
                        <div className="flex flex-col gap-2 md:flex-row">
                          <GroupTitleEditor
                            label="EN"
                            initialTitle={enTitle?.title ?? ""}
                            titleLabel={t("titleLabel")}
                            saveLabel={actionsT("save")}
                            saving={saving === `group-${group.id}-en`}
                            onSave={(title) =>
                              void handleSaveGroupTitle(group.id, "en", title)
                            }
                          />
                          <GroupTitleEditor
                            label="TH"
                            initialTitle={thTitle?.title ?? ""}
                            titleLabel={t("titleLabel")}
                            saveLabel={actionsT("save")}
                            saving={saving === `group-${group.id}-th`}
                            onSave={(title) =>
                              void handleSaveGroupTitle(group.id, "th", title)
                            }
                          />
                        </div>

                        <div className="flex flex-col gap-3">
                          {group.questions.map((question) => {
                            const isQExpanded =
                              expandedQuestionId === question.id;
                            const enTranslation = question.translations.find(
                              (tr) => tr.locale === "en",
                            );
                            const thTranslation = question.translations.find(
                              (tr) => tr.locale === "th",
                            );
                            const qDisplay =
                              (locale === "th"
                                ? thTranslation?.questionText
                                : enTranslation?.questionText) ||
                              enTranslation?.questionText ||
                              t("untitledQuestion");

                            return (
                              <Collapsible
                                key={question.id}
                                id={`faq-question-${question.id}`}
                                open={isQExpanded}
                                onOpenChange={(open) => {
                                  setExpandedQuestionId(
                                    open ? question.id : null,
                                  );
                                }}
                              >
                                <div className="rounded-lg border border-border/40 shadow-sm">
                                  {/* Question header */}
                                  <div className="flex items-center justify-between gap-2 p-2">
                                    <CollapsibleTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        className="flex flex-1 p-2"
                                      >
                                        <ChevronDown
                                          className={cn(
                                            "transition-transform",
                                            isQExpanded || "-rotate-90",
                                          )}
                                        />
                                        <Text
                                          size="xs"
                                          className="flex-1 text-wrap text-left"
                                        >
                                          {qDisplay}
                                        </Text>
                                      </Button>
                                    </CollapsibleTrigger>
                                    <Button
                                      size="icon"
                                      variant="destructive"
                                      onClick={() =>
                                        setDeleteTarget({
                                          type: "question",
                                          id: question.id,
                                        })
                                      }
                                      aria-label={t("delete")}
                                    >
                                      <Trash2 />
                                    </Button>
                                  </div>

                                  <CollapsibleContent>
                                    <div className="flex flex-col gap-2 p-2 pt-0 md:flex-row">
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
                                          saving ===
                                          `translation-${question.id}-en`
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
                                          saving ===
                                          `translation-${question.id}-th`
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
                                  </CollapsibleContent>
                                </div>
                              </Collapsible>
                            );
                          })}

                          <Button
                            size="sm"
                            variant="accent"
                            onClick={() => void handleAddQuestion(group.id)}
                            className="w-fit"
                          >
                            <Plus />
                            {t("addQuestion")}
                          </Button>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </CardContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>
      )}

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        title={
          deleteTarget?.type === "group"
            ? t("groupDeleteTitle")
            : t("questionDeleteTitle")
        }
        description={
          deleteTarget?.type === "group"
            ? t("groupDeleteDescription")
            : t("questionDeleteDescription")
        }
        confirmLabel={t("delete")}
        confirmLoadingLabel={actionsT("loading")}
        cancelLabel={t("cancel")}
        onConfirm={async () => {
          if (!deleteTarget) return;
          if (deleteTarget.type === "group") {
            await handleDeleteGroup(deleteTarget.id);
          } else {
            await handleDeleteQuestion(deleteTarget.id);
          }
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
