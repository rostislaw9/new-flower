"use client";

import { useEffect, useMemo, useState } from "react";

import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTopLoader } from "nextjs-toploader";

import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  Loader2,
  SavePlus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Badge } from "@/components/styled/Badge";
import { Button } from "@/components/styled/Button";
import { FormField } from "@/components/styled/FormField";
import { Heading, Text } from "@/components/styled/Typography";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { type Locale, defaultLocale } from "@/i18n/config";
import {
  createPortfolioItemsBulk,
  deletePortfolioItem,
} from "@/lib/actions/portfolio";
import { getLocalizedPath, isSupportedLocale } from "@/lib/locale-utils";
import {
  PORTFOLIO_CATEGORIES,
  type PortfolioCategory,
} from "@/lib/portfolio-data";
import { cn } from "@/lib/utils";

interface DraftPortfolioItem {
  id: string;
  imageUrl: string;
  width: number;
  height: number;
  title: string;
  description: string;
  category: string;
  featured: boolean;
  displayOrder: number;
}

const MAX_FILES = 20;

function createDraftId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function BulkPortfolioPage() {
  const rawLocale = useLocale();
  const locale: Locale = isSupportedLocale(rawLocale)
    ? rawLocale
    : defaultLocale;
  const router = useRouter();
  const { start } = useTopLoader();
  const bulkT = useTranslations("admin.portfolio.bulk");
  const formT = useTranslations("admin.portfolio.form");
  const actionsT = useTranslations("admin.common.actions");

  const [drafts, setDrafts] = useState<DraftPortfolioItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const backHref = useMemo(
    () => getLocalizedPath("/admin/portfolio", locale),
    [locale],
  );

  const handleUploadComplete = (
    uploads: { url: string; width: number; height: number }[],
  ) => {
    if (uploads.length === 0) return;

    const appended: DraftPortfolioItem[] = [];
    setDrafts((prev) => {
      const existingUrls = new Set(prev.map((draft) => draft.imageUrl));
      const baseLength = prev.length;

      uploads.forEach((upload) => {
        if (existingUrls.has(upload.url)) {
          return;
        }
        const nextIndex = baseLength + appended.length;
        appended.push({
          id: createDraftId(),
          imageUrl: upload.url,
          width: upload.width,
          height: upload.height,
          title: "",
          description: "",
          category: "",
          featured: false,
          displayOrder: nextIndex,
        });
      });

      return [...prev, ...appended];
    });

    if (appended.length > 0) {
      setSelectedId((current) => current ?? appended[0]?.id ?? null);
    }
  };

  const handleDraftChange = (
    id: string,
    updates: Partial<
      Omit<DraftPortfolioItem, "id" | "imageUrl" | "width" | "height">
    >,
  ) => {
    setDrafts((prev) =>
      prev.map((draft) => (draft.id === id ? { ...draft, ...updates } : draft)),
    );
  };

  const handleRemoveDraft = async (id: string) => {
    const draft = drafts.find((d) => d.id === id);
    if (draft) {
      try {
        await deletePortfolioItem(draft.imageUrl);
      } catch (error) {
        console.error(
          "[BulkPortfolioPage] Failed to delete from Cloudinary:",
          error,
        );
      }
    }
    setDrafts((prev) => {
      const next = prev.filter((draft) => draft.id !== id);
      setSelectedId((current) => {
        if (next.length === 0) {
          return null;
        }
        if (
          !current ||
          current === id ||
          !next.some((draft) => draft.id === current)
        ) {
          return next[0]?.id ?? null;
        }
        return current;
      });
      return next;
    });
  };

  useEffect(() => {
    if (drafts.length === 0) {
      if (selectedId !== null) {
        setSelectedId(null);
      }
      return;
    }

    if (!selectedId || !drafts.some((draft) => draft.id === selectedId)) {
      setSelectedId(drafts[0]?.id ?? null);
    }
  }, [drafts, selectedId]);

  const isDraftComplete = (draft: DraftPortfolioItem) =>
    draft.title.trim().length > 0 && draft.category.trim().length > 0;

  const hasMissingRequired = drafts.some((draft) => !isDraftComplete(draft));

  const normalizedPayload = drafts.map((draft, index) => ({
    title: draft.title.trim(),
    description: draft.description.trim() || null,
    imageUrl: draft.imageUrl,
    category: draft.category as PortfolioCategory,
    featured: draft.featured,
    displayOrder: Number.isFinite(draft.displayOrder)
      ? draft.displayOrder
      : index,
    width: draft.width,
    height: draft.height,
  }));

  async function handleSubmit() {
    if (drafts.length === 0 || hasMissingRequired) {
      toast.error(bulkT("alerts.missingFields"));
      return;
    }

    setSubmitting(true);
    try {
      const result = await createPortfolioItemsBulk(normalizedPayload);
      if (!result.success) {
        toast.error(result.message || bulkT("alerts.createFailed"));
        setSubmitting(false);
        return;
      }

      toast.success(bulkT("alerts.created", { count: result.count }));
      setDrafts([]);
      setSelectedId(null);
      setSubmitting(false);
      start();
      router.push(backHref);
      router.refresh();
    } catch (error) {
      console.error("[BulkPortfolioPage] create", error);
      toast.error(bulkT("alerts.createFailed"));
      setSubmitting(false);
    }
  }

  const allReady = drafts.length > 0 && drafts.every(isDraftComplete);
  const disableSubmit = drafts.length === 0 || !allReady || submitting;
  const selectedDraft = drafts.find((draft) => draft.id === selectedId) ?? null;

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={bulkT("title")}
        subtitle={bulkT("subtitle")}
        actions={
          <Button
            size="sm"
            href={getLocalizedPath("/admin/portfolio", locale)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft />
            {actionsT("back")}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <Card className="rounded-2xl border border-border/60 bg-card/60 shadow-lg">
            <CardContent className="flex flex-col gap-6 pt-6">
              <div>
                <Heading size="sm" serif={false}>
                  {bulkT("instructions.upload", { count: MAX_FILES })}
                </Heading>
                <Text size="sm" muted>
                  {bulkT("instructions.details")}
                </Text>
              </div>
              <ImageUploader
                folder="portfolio"
                maxFiles={MAX_FILES}
                onUploadComplete={handleUploadComplete}
                showPreviewGrid={true}
              />
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/60 bg-card/60 shadow-lg">
            <CardContent className="flex flex-col gap-4 pt-6">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <Heading size="sm" serif={false}>
                    {bulkT("labels.thumbnailsHeading")}
                  </Heading>
                  <Text size="sm" muted>
                    {bulkT("labels.selectPrompt")}
                  </Text>
                </div>
                <Text size="sm" muted>
                  {drafts.length} / {MAX_FILES}
                </Text>
              </div>

              {drafts.length === 0 ? (
                <Empty className="rounded-xl border">
                  <EmptyHeader>
                    <EmptyTitle>
                      <Heading size="sm" serif={false}>
                        {bulkT("empty.title")}
                      </Heading>
                    </EmptyTitle>
                  </EmptyHeader>
                  <EmptyContent>
                    <Text muted>{bulkT("empty.description")}</Text>
                  </EmptyContent>
                </Empty>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {drafts.map((draft, index) => {
                    const isSelected = draft.id === selectedId;
                    const isComplete = isDraftComplete(draft);
                    return (
                      <button
                        key={draft.id}
                        type="button"
                        onClick={() => setSelectedId(draft.id)}
                        className={cn(
                          "relative aspect-square overflow-hidden rounded-xl border bg-muted/20",
                          isSelected
                            ? "border-accent ring-2 ring-accent"
                            : "border-border/70",
                          isComplete && !isSelected && "border-emerald-500/60",
                        )}
                      >
                        <Image
                          src={draft.imageUrl}
                          alt={draft.title || `Upload ${index + 1}`}
                          fill
                          sizes="(max-width: 768px) 50vw, 20vw"
                          className="object-cover"
                        />
                        {isComplete ? (
                          <CheckCircle2 className="absolute right-2 top-2 h-5 w-5 text-emerald-600/80" />
                        ) : (
                          <CircleAlert className="absolute right-2 top-2 h-5 w-5 text-rose-600/80" />
                        )}
                        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent px-2 pb-2 pt-6 text-xs text-white">
                          <span>#{index + 1}</span>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-medium",
                              isComplete
                                ? "bg-emerald-600/80 text-white"
                                : "bg-rose-600/80 text-white",
                            )}
                          >
                            {isComplete
                              ? bulkT("labels.readyBadge")
                              : bulkT("labels.needsDetails")}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-2xl border border-border/60 bg-card/60 shadow-lg">
          <CardContent className="flex flex-col gap-6 pt-6">
            {selectedDraft ? (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <Heading size="sm" serif={false}>
                      {bulkT("labels.detailsHeading")}
                    </Heading>
                    <Text size="sm" muted>
                      {bulkT("labels.detailsSubheading")}
                    </Text>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveDraft(selectedDraft.id)}
                  >
                    <Trash2 />
                    {bulkT("buttons.remove")}
                  </Button>
                </div>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-6">
                  <div className="flex flex-1 flex-col gap-4">
                    <FormField
                      label={formT("titleLabel")}
                      htmlFor={`title-${selectedDraft.id}`}
                      required
                    >
                      <Input
                        id={`title-${selectedDraft.id}`}
                        value={selectedDraft.title}
                        onChange={(event) =>
                          handleDraftChange(selectedDraft.id, {
                            title: event.target.value,
                          })
                        }
                        placeholder={formT("titlePlaceholder")}
                      />
                    </FormField>

                    <FormField
                      label={formT("categoryLabel")}
                      htmlFor={`category-${selectedDraft.id}`}
                      required
                    >
                      <Select
                        value={selectedDraft.category}
                        onValueChange={(value) =>
                          handleDraftChange(selectedDraft.id, {
                            category: value,
                          })
                        }
                      >
                        <SelectTrigger id={`category-${selectedDraft.id}`}>
                          <SelectValue
                            placeholder={formT("categoryPlaceholder")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {PORTFOLIO_CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>

                  <div className="relative hidden aspect-square w-40 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-muted/20 lg:block">
                    <Image
                      src={selectedDraft.imageUrl}
                      alt={selectedDraft.title || "Selected upload"}
                      fill
                      className="object-cover"
                      sizes="160px"
                    />
                  </div>
                </div>

                <FormField
                  label={formT("descriptionLabel")}
                  hint={formT("optionalTag")}
                  htmlFor={`description-${selectedDraft.id}`}
                >
                  <Textarea
                    id={`description-${selectedDraft.id}`}
                    value={selectedDraft.description}
                    onChange={(event) =>
                      handleDraftChange(selectedDraft.id, {
                        description: event.target.value,
                      })
                    }
                    rows={4}
                    placeholder={formT("descriptionPlaceholder")}
                  />
                </FormField>

                <div className="flex flex-col gap-4 rounded-xl border border-dashed border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={`featured-${selectedDraft.id}`}
                      checked={selectedDraft.featured}
                      onCheckedChange={(checked) =>
                        handleDraftChange(selectedDraft.id, {
                          featured: Boolean(checked),
                        })
                      }
                      className="border-accent data-[state=checked]:bg-accent"
                    />
                    <Badge variant="accent">{formT("featuredLabel")}</Badge>
                  </div>
                  <FormField
                    label={formT("orderLabel")}
                    htmlFor={`order-${selectedDraft.id}`}
                  >
                    <Input
                      id={`order-${selectedDraft.id}`}
                      type="number"
                      value={selectedDraft.displayOrder}
                      onChange={(event) => {
                        const parsed = Number(event.target.value);
                        handleDraftChange(selectedDraft.id, {
                          displayOrder: Number.isFinite(parsed) ? parsed : 0,
                        });
                      }}
                    />
                  </FormField>
                </div>
              </>
            ) : (
              <Empty className="rounded-xl border">
                <EmptyHeader>
                  <EmptyTitle>
                    <Heading size="sm" serif={false}>
                      {bulkT("placeholders.selectTitle")}
                    </Heading>
                  </EmptyTitle>
                </EmptyHeader>
                <EmptyContent>
                  <Text muted>{bulkT("placeholders.selectDescription")}</Text>
                </EmptyContent>
              </Empty>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button
          variant="accent"
          type="button"
          disabled={disableSubmit}
          onClick={handleSubmit}
        >
          {submitting ? (
            <>
              <Loader2 className="animate-spin" />
              {actionsT("creating")}
            </>
          ) : (
            <>
              <SavePlus />
              {bulkT("buttons.create")}
            </>
          )}
        </Button>
        <Link href={backHref}>
          <Button variant="outline" type="button" className="w-full">
            {actionsT("cancel")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
