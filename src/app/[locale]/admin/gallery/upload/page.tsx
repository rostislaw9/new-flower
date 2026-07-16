"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTopLoader } from "nextjs-toploader";

import {
  CheckCircle2,
  Loader2,
  MoveLeft,
  SaveCheck,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ImageUploader } from "@/components/common/ImageUploader";
import { Button } from "@/components/styled/Button";
import { Heading, Text } from "@/components/styled/Typography";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
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
  createGalleryItems,
  deleteCloudinaryImage,
} from "@/lib/actions/gallery";
import {
  clearFormState,
  loadFormState,
  saveFormState,
} from "@/lib/form-storage";
import { GALLERY_CATEGORIES, type GalleryCategory } from "@/lib/gallery-data";
import { getLocalizedPath, isSupportedLocale } from "@/lib/locale-utils";
import { cn } from "@/lib/utils";

interface DraftGalleryItem {
  id: string;
  imageUrl: string;
  width: number;
  height: number;
  title: string;
  description: string;
  category: string;
}

interface SelectedDraftFormValues {
  title: string;
  category: string;
  description: string;
}

const SELECTED_DRAFT_DEFAULTS: SelectedDraftFormValues = {
  title: "",
  category: "",
  description: "",
};

const MAX_FILES = 15;

const UPLOAD_DRAFTS_STORAGE_KEY = "gallery-upload-drafts";

function createDraftId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function UploadGalleryPage() {
  const rawLocale = useLocale();
  const locale: Locale = isSupportedLocale(rawLocale)
    ? rawLocale
    : defaultLocale;

  const router = useRouter();
  const { start } = useTopLoader();
  const uploadT = useTranslations("admin.gallery.upload");
  const formT = useTranslations("admin.gallery.form");
  const actionsT = useTranslations("admin.common.actions");

  const [drafts, setDrafts] = useState<DraftGalleryItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const {
    control: selectedDraftControl,
    register: selectedDraftRegister,
    reset: resetSelectedDraftForm,
    watch: watchSelectedDraftForm,
    formState: { errors: selectedDraftErrors },
  } = useForm<SelectedDraftFormValues>({
    defaultValues: SELECTED_DRAFT_DEFAULTS,
  });

  useEffect(() => {
    const saved = loadFormState<{
      drafts: DraftGalleryItem[];
      selectedId: string | null;
    }>(UPLOAD_DRAFTS_STORAGE_KEY, locale);
    if (saved?.drafts?.length) {
      setDrafts(saved.drafts);
      setSelectedId(saved.selectedId ?? saved.drafts[0]?.id ?? null);
    }
    setHydrated(true);
  }, [locale]);

  useEffect(() => {
    if (!hydrated) return;
    if (drafts.length === 0) {
      clearFormState(UPLOAD_DRAFTS_STORAGE_KEY);
    } else {
      saveFormState(UPLOAD_DRAFTS_STORAGE_KEY, { drafts, selectedId }, locale);
    }
  }, [drafts, selectedId, hydrated, locale]);

  const backHref = useMemo(
    () => getLocalizedPath("/admin/gallery", locale),
    [locale],
  );

  const handleUploadComplete = (
    uploads: { url: string; width: number; height: number }[],
  ) => {
    if (uploads.length === 0) return;

    const appended: DraftGalleryItem[] = [];
    setDrafts((prev) => {
      const existingUrls = new Set(prev.map((draft) => draft.imageUrl));

      uploads.forEach((upload) => {
        if (existingUrls.has(upload.url)) {
          return;
        }
        appended.push({
          id: createDraftId(),
          imageUrl: upload.url,
          width: upload.width,
          height: upload.height,
          title: "",
          description: "",
          category: "",
        });
      });

      return [...prev, ...appended];
    });

    if (appended.length > 0) {
      setSelectedId((current) => current ?? appended[0]?.id ?? null);
    }
  };

  const handleDraftChange = useCallback(
    (
      id: string,
      updates: Partial<
        Omit<DraftGalleryItem, "id" | "imageUrl" | "width" | "height">
      >,
    ) => {
      setDrafts((prev) =>
        prev.map((draft) =>
          draft.id === id ? { ...draft, ...updates } : draft,
        ),
      );
    },
    [],
  );

  const handleRemoveDraft = async (id: string) => {
    setRemovingId(id);
    const draft = drafts.find((d) => d.id === id);
    if (draft) {
      try {
        await deleteCloudinaryImage(draft.imageUrl);
      } catch (error) {
        console.error(
          "[UploadGalleryPage] Failed to delete from Cloudinary:",
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
    setRemovingId(null);
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

  const selectedDraft = drafts.find((draft) => draft.id === selectedId) ?? null;

  useEffect(() => {
    if (!selectedDraft) {
      resetSelectedDraftForm(SELECTED_DRAFT_DEFAULTS);
      return;
    }

    resetSelectedDraftForm({
      title: selectedDraft.title,
      category: selectedDraft.category,
      description: selectedDraft.description,
    });
  }, [selectedDraft, resetSelectedDraftForm]);

  useEffect(() => {
    if (!selectedDraft) {
      return;
    }

    const subscription = watchSelectedDraftForm((values) => {
      handleDraftChange(selectedDraft.id, values);
    });

    return () => subscription.unsubscribe();
  }, [selectedDraft, watchSelectedDraftForm, handleDraftChange]);

  const isDraftComplete = (draft: DraftGalleryItem) =>
    draft.title.trim().length > 0 && draft.category.trim().length > 0;

  const hasMissingRequired = drafts.some((draft) => !isDraftComplete(draft));

  const normalizedPayload = drafts.map((draft) => ({
    title: draft.title.trim(),
    description: draft.description.trim() || null,
    imageUrl: draft.imageUrl,
    category: draft.category as GalleryCategory,
    width: draft.width,
    height: draft.height,
  }));

  async function handleSubmit() {
    if (drafts.length === 0 || hasMissingRequired) {
      toast.error(uploadT("alerts.missingFields"));
      return;
    }

    setSubmitting(true);
    try {
      const result = await createGalleryItems(normalizedPayload);
      if (!result.success) {
        toast.error(result.message || uploadT("alerts.createFailed"));
        setSubmitting(false);
        return;
      }

      toast.success(uploadT("alerts.created", { count: result.count }));
      setDrafts([]);
      setSelectedId(null);
      setSubmitting(false);
      try {
        clearFormState(UPLOAD_DRAFTS_STORAGE_KEY);
      } catch {
        // ignore
      }
      start();
      router.push(backHref);
      router.refresh();
    } catch (error) {
      console.error("[UploadGalleryPage] create", error);
      toast.error(uploadT("alerts.createFailed"));
      setSubmitting(false);
    }
  }

  const allReady = drafts.length > 0 && drafts.every(isDraftComplete);
  const disableSubmit = drafts.length === 0 || !allReady || submitting;
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={uploadT("title")}
        subtitle={uploadT("subtitle")}
        actions={
          <Button
            size="sm"
            href={backHref}
            variant="outline"
            className="flex items-center gap-2"
          >
            <MoveLeft />
            {actionsT("back")}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-6">
          <Card className="rounded-2xl border border-border/60 bg-card/60 shadow-md">
            <CardContent className="flex flex-col gap-6 pt-6">
              <div>
                <Heading size="sm" serif={false}>
                  {uploadT("instructions.upload", { count: MAX_FILES })}
                </Heading>
                <Text size="sm" muted>
                  {uploadT("instructions.details")}
                </Text>
              </div>
              <ImageUploader
                folder="gallery"
                maxFiles={Math.max(0, MAX_FILES - drafts.length)}
                useOverwrite={true}
                onUploadComplete={handleUploadComplete}
              />
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/60 bg-card/60 shadow-md">
            <CardContent className="flex flex-col gap-4 pt-6">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <Heading size="sm" serif={false}>
                    {uploadT("labels.thumbnailsHeading")}
                  </Heading>
                  <Text size="sm" muted>
                    {uploadT("labels.selectPrompt")}
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
                        {uploadT("empty.title")}
                      </Heading>
                    </EmptyTitle>
                  </EmptyHeader>
                  <EmptyContent>
                    <Text muted>{uploadT("empty.description")}</Text>
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
                          "relative aspect-square overflow-hidden rounded-xl border bg-muted/20 hover:border-accent",
                          isSelected
                            ? "border-accent ring-2 ring-accent"
                            : "border-border/60",
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
                        {isComplete && (
                          <CheckCircle2 className="absolute right-2 top-2 h-5 w-5 text-emerald-600/80" />
                        )}
                        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent px-2 pb-2 pt-6 text-xs text-white">
                          <span>#{index + 1}</span>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-medium",
                              isComplete
                                ? "bg-emerald-600/80 text-white"
                                : "bg-amber-600/80 text-white",
                            )}
                          >
                            {isComplete
                              ? uploadT("labels.readyBadge")
                              : uploadT("labels.needsDetails")}
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

        <div className="sticky top-20 flex h-fit flex-col gap-6">
          <Card className="rounded-2xl border border-border/60 bg-card/60 shadow-md">
            <CardContent className="flex flex-col gap-6 pt-6">
              {selectedDraft ? (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <Heading size="sm" serif={false}>
                        {uploadT("labels.detailsHeading")}
                      </Heading>
                      <Text size="sm" muted>
                        {uploadT("labels.detailsSubheading")}
                      </Text>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveDraft(selectedDraft.id)}
                      disabled={removingId === selectedDraft.id}
                    >
                      {removingId === selectedDraft.id ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <Trash2 />
                      )}
                      <span className="hidden sm:block">
                        {removingId === selectedDraft.id
                          ? uploadT("buttons.removing")
                          : uploadT("buttons.remove")}
                      </span>
                    </Button>
                  </div>

                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-6">
                    <div className="flex flex-1 flex-col gap-4">
                      <Field data-invalid={!!selectedDraftErrors.title}>
                        <FieldContent>
                          <FieldLabel htmlFor={`title-${selectedDraft.id}`}>
                            {formT("titleLabel")}
                          </FieldLabel>
                          <Input
                            id={`title-${selectedDraft.id}`}
                            placeholder={formT("titlePlaceholder")}
                            {...selectedDraftRegister("title", {
                              required: true,
                            })}
                          />
                          <FieldError errors={[selectedDraftErrors.title]} />
                        </FieldContent>
                      </Field>

                      <Field data-invalid={!!selectedDraftErrors.category}>
                        <FieldContent>
                          <FieldLabel htmlFor={`category-${selectedDraft.id}`}>
                            {formT("categoryLabel")}
                          </FieldLabel>
                          <Controller
                            control={selectedDraftControl}
                            name="category"
                            rules={{ required: true }}
                            render={({ field }) => (
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger
                                  id={`category-${selectedDraft.id}`}
                                >
                                  <SelectValue
                                    placeholder={formT("categoryPlaceholder")}
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  {GALLERY_CATEGORIES.map((category) => (
                                    <SelectItem key={category} value={category}>
                                      {category}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                          <FieldError errors={[selectedDraftErrors.category]} />
                        </FieldContent>
                      </Field>
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

                  <Field data-invalid={!!selectedDraftErrors.description}>
                    <FieldContent>
                      <div className="flex items-baseline justify-between gap-2">
                        <FieldLabel htmlFor={`description-${selectedDraft.id}`}>
                          {formT("descriptionLabel")}
                        </FieldLabel>
                        <FieldDescription>
                          {formT("optionalTag")}
                        </FieldDescription>
                      </div>
                      <Textarea
                        id={`description-${selectedDraft.id}`}
                        rows={4}
                        placeholder={formT("descriptionPlaceholder")}
                        {...selectedDraftRegister("description")}
                      />
                      <FieldError errors={[selectedDraftErrors.description]} />
                    </FieldContent>
                  </Field>
                </>
              ) : (
                <Empty className="rounded-xl border">
                  <EmptyHeader>
                    <EmptyTitle>
                      <Heading size="sm" serif={false}>
                        {uploadT("placeholders.selectTitle")}
                      </Heading>
                    </EmptyTitle>
                  </EmptyHeader>
                  <EmptyContent>
                    <Text muted>
                      {uploadT("placeholders.selectDescription")}
                    </Text>
                  </EmptyContent>
                </Empty>
              )}
            </CardContent>
          </Card>

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
                  <SaveCheck />
                  {uploadT("buttons.create")}
                </>
              )}
            </Button>
            <Button type="button" variant="outline" href={backHref}>
              {actionsT("cancel")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
