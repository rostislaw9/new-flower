"use client";

import { useCallback, useEffect, useState } from "react";

import { useLocale, useTranslations } from "next-intl";

import { ChevronDown, Loader2, MoveLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BioEditor } from "@/components/admin/about/BioEditor";
import { JourneyEditor } from "@/components/admin/about/JourneyEditor";
import { YearEditor } from "@/components/admin/about/YearEditor";
import { Button } from "@/components/styled/Button";
import { DeleteConfirmDialog } from "@/components/styled/DeleteConfirmDialog";
import { Eyebrow, Text } from "@/components/styled/Typography";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { type Locale, defaultLocale } from "@/i18n/config";
import {
  createAboutBio,
  createAboutJourney,
  deleteAboutJourney,
  updateAboutBioTranslation,
  updateAboutJourneyTranslation,
  updateAboutJourneyYear,
} from "@/lib/actions/about";
import { getLocalizedPath, isSupportedLocale } from "@/lib/locale-utils";
import { cn } from "@/lib/utils";

interface BioTranslationData {
  id: string;
  locale: string;
  title: string;
  description: string;
}

interface BioData {
  id: string;
  translations: BioTranslationData[];
}

interface JourneyTranslationData {
  id: string;
  locale: string;
  title: string;
  description: string;
}

interface JourneyData {
  id: string;
  displayOrder: number;
  year: string;
  translations: JourneyTranslationData[];
}

interface AboutApiResponse {
  bio: BioData | null;
  journeys: JourneyData[];
}

export default function AboutAdminPage() {
  const rawLocale = useLocale();
  const locale: Locale = isSupportedLocale(rawLocale)
    ? rawLocale
    : defaultLocale;
  const t = useTranslations("admin.about");
  const actionsT = useTranslations("admin.common.actions");

  const backHref = getLocalizedPath("/admin", locale);

  const [bio, setBio] = useState<BioData | null>(null);
  const [journeys, setJourneys] = useState<JourneyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [expandedJourneyId, setExpandedJourneyId] = useState<string | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/about", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch about data");
      const data = (await res.json()) as AboutApiResponse;
      setBio(data.bio);
      setJourneys(data.journeys);
    } catch {
      toast.error(t("error"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleSaveBio = async (
    bioId: string | null,
    locale: string,
    title: string,
    description: string,
  ) => {
    setSaving(`bio-${bioId ?? "new"}-${locale}`);
    let result;
    if (bioId) {
      result = await updateAboutBioTranslation(
        bioId,
        locale,
        title,
        description,
      );
    } else {
      result = await createAboutBio(locale, title, description);
    }
    if (result.success) {
      toast.success(t("bioSaved"));
      await fetchData();
    } else {
      toast.error(result.message);
    }
    setSaving(null);
  };

  const handleAddJourney = async () => {
    const result = await createAboutJourney();
    if (result.success && result.id) {
      toast.success(t("journeyCreated"));
      await fetchData();
      setExpandedJourneyId(result.id);
      requestAnimationFrame(() => {
        document
          .getElementById(`about-journey-${result.id}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    } else if (result.success) {
      toast.success(t("journeyCreated"));
      await fetchData();
    } else {
      toast.error(result.message);
    }
  };

  const handleDeleteJourney = async (id: string) => {
    const result = await deleteAboutJourney(id);
    if (result.success) {
      toast.success(t("journeyDeleted"));
      setExpandedJourneyId(null);
      await fetchData();
    } else {
      toast.error(result.message);
    }
  };

  const handleSaveJourneyYear = async (journeyId: string, year: string) => {
    setSaving(`journey-year-${journeyId}`);
    const result = await updateAboutJourneyYear(journeyId, year);
    if (result.success) {
      toast.success(t("journeySaved"));
      await fetchData();
    } else {
      toast.error(result.message);
    }
    setSaving(null);
  };

  const handleSaveJourney = async (
    journeyId: string,
    locale: string,
    title: string,
    description: string,
  ) => {
    setSaving(`journey-${journeyId}-${locale}`);
    const result = await updateAboutJourneyTranslation(
      journeyId,
      locale,
      title,
      description,
    );
    if (result.success) {
      toast.success(t("journeySaved"));
      await fetchData();
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
              onClick={handleAddJourney}
              className="flex items-center gap-2"
            >
              <Plus />
              {t("addJourney")}
            </Button>
          </div>
        }
      />

      {/* Bio section */}
      <div className="flex flex-col gap-3">
        <Eyebrow size="xs">{t("bioSection")}</Eyebrow>
        <Card className="rounded-2xl border border-border/60 bg-card/60 shadow-lg">
          <CardContent className="flex flex-col gap-2 p-4 md:flex-row">
            {(
              bio?.translations ?? [
                { id: "en", locale: "en", title: "", description: "" },
                { id: "th", locale: "th", title: "", description: "" },
              ]
            ).map((tr) => (
              <BioEditor
                key={tr.id}
                label={tr.locale.toUpperCase()}
                initialTitle={tr.title}
                initialDescription={tr.description}
                titleLabel={t("titleLabel")}
                descriptionLabel={t("descriptionLabel")}
                saveLabel={actionsT("save")}
                saving={saving === `bio-${bio?.id ?? "new"}-${tr.locale}`}
                onSave={(title, description) =>
                  handleSaveBio(bio?.id ?? null, tr.locale, title, description)
                }
              />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Journey section */}
      <div className="flex flex-col gap-3">
        <Eyebrow size="xs">{t("journeySection")}</Eyebrow>
        {journeys.length === 0 ? (
          <Text muted>{t("noJourneys")}</Text>
        ) : (
          journeys.map((journey) => {
            const isExpanded = expandedJourneyId === journey.id;
            const enTr = journey.translations.find((t) => t.locale === "en");
            const displayTitle = enTr?.title || t("untitledJourney");

            return (
              <Collapsible
                key={journey.id}
                id={`about-journey-${journey.id}`}
                open={isExpanded}
                onOpenChange={(open) => {
                  setExpandedJourneyId(open ? journey.id : null);
                }}
              >
                <Card className="rounded-2xl border border-border/60 bg-card/60 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <CollapsibleTrigger asChild>
                        <button
                          type="button"
                          className="flex flex-1 items-center gap-2 text-muted-foreground hover:text-foreground"
                        >
                          <ChevronDown
                            className={cn(
                              "transition-transform",
                              isExpanded || "-rotate-90",
                            )}
                          />
                          <Text
                            size="sm"
                            className="flex-1 text-left hover:text-foreground"
                          >
                            {displayTitle}
                          </Text>
                        </button>
                      </CollapsibleTrigger>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => setDeleteTarget(journey.id)}
                        aria-label={t("delete")}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                    <CollapsibleContent>
                      <div className="mt-3 flex flex-col gap-2">
                        <YearEditor
                          initialYear={journey.year}
                          yearLabel={t("yearLabel")}
                          buddhistYearLabel={t("buddhistYearLabel")}
                          saveLabel={actionsT("save")}
                          saving={saving === `journey-year-${journey.id}`}
                          onSave={(year) =>
                            void handleSaveJourneyYear(journey.id, year)
                          }
                        />
                        <div className="flex flex-col gap-2 md:flex-row">
                          {journey.translations.map((tr) => (
                            <JourneyEditor
                              key={tr.id}
                              label={tr.locale.toUpperCase()}
                              initialTitle={tr.title}
                              initialDescription={tr.description}
                              titleLabel={t("titleLabel")}
                              descriptionLabel={t("descriptionLabel")}
                              saveLabel={actionsT("save")}
                              saving={
                                saving === `journey-${journey.id}-${tr.locale}`
                              }
                              onSave={(title, description) =>
                                handleSaveJourney(
                                  journey.id,
                                  tr.locale,
                                  title,
                                  description,
                                )
                              }
                            />
                          ))}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </CardContent>
                </Card>
              </Collapsible>
            );
          })
        )}
      </div>

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        title={t("journeyDeleteTitle")}
        description={t("journeyDeleteDescription")}
        confirmLabel={t("delete")}
        confirmLoadingLabel={actionsT("deleting")}
        cancelLabel={t("cancel")}
        onConfirm={async () => {
          if (deleteTarget) {
            await handleDeleteJourney(deleteTarget);
          }
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
