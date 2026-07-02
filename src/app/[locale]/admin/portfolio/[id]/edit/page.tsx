"use client";

import { use, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { ImageOff, Loader2, MoveLeft, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ImageUploader } from "@/components/common/ImageUploader";
import { Button } from "@/components/styled/Button";
import { DeleteConfirmDialog } from "@/components/styled/DeleteConfirmDialog";
import { Heading, Text } from "@/components/styled/Typography";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  deletePortfolioItem,
  updatePortfolioItem,
} from "@/lib/actions/portfolio";
import { getLocalizedPath, isSupportedLocale } from "@/lib/locale-utils";
import type { PortfolioItem } from "@/lib/portfolio-data";
import { PORTFOLIO_CATEGORIES } from "@/lib/portfolio-data";

interface EditPortfolioItemPageProps {
  params: Promise<{ id: string; locale: string }>;
}
interface PortfolioFormValues {
  title: string;
  category: string;
  description: string;
  imageUrl: string;
}

export default function EditPortfolioItemPage({
  params,
}: EditPortfolioItemPageProps) {
  const { locale: rawLocale, id } = use(params);
  const locale: Locale = isSupportedLocale(rawLocale)
    ? rawLocale
    : defaultLocale;
  const router = useRouter();
  const t = useTranslations("admin.portfolio");
  const actionsT = useTranslations("admin.common.actions");
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<PortfolioFormValues>();
  const imageUrl = watch("imageUrl");
  const [item, setItem] = useState<PortfolioItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<PortfolioItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImageLoading, setCurrentImageLoading] = useState(true);

  const backHref = useMemo(
    () => getLocalizedPath("/admin/portfolio", locale),
    [locale],
  );

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await fetch(`/api/portfolio/${id}`);
        if (!response.ok) throw new Error(t("edit.alerts.notFound"));
        const data = (await response.json()) as PortfolioItem;
        setItem(data);
        setCurrentImageLoading(true);
        reset({
          title: data.title,
          category: data.category,
          description: data.description ?? "",
          imageUrl: data.imageUrl,
        });
      } catch {
        const message = t("edit.alerts.loadFailed");
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    void fetchItem();
  }, [id, t, reset]);

  async function onSubmit(values: PortfolioFormValues) {
    setSaving(true);
    setError(null);

    const formData = new FormData();

    Object.entries(values).forEach(([key, value]) => {
      formData.set(key, String(value));
    });

    const result = await updatePortfolioItem(id, formData);

    if (result.success) {
      toast.success(t("edit.alerts.updated"));
      router.push(backHref);
    } else {
      const message = result.message || t("edit.alerts.updateFailed");
      toast.error(message);
      setError(message);
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteItem) return;

    const result = await deletePortfolioItem(deleteItem.id);

    if (result.success) {
      toast.success(t("alerts.deleteSuccess"));
      router.push(backHref);
    } else {
      toast.error(result.message || t("alerts.deleteFailed"));
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin" />
        <Text muted>{actionsT("loading")}</Text>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="space-y-4">
        <Button size="sm" variant="outline" href={backHref}>
          <MoveLeft />
          {actionsT("back")}
        </Button>
        <Empty className="rounded-xl border">
          <EmptyHeader>
            <EmptyMedia>
              <ImageOff />
            </EmptyMedia>
            <EmptyTitle>
              <Heading size="sm" serif={false}>
                {t("edit.alerts.notFound")}
              </Heading>
            </EmptyTitle>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={t("edit.title")}
        subtitle={t("edit.subtitle")}
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

      {error && (
        <div className="border border-red-200 bg-red-950/50 p-4 text-red-400">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
        noValidate
      >
        <div className="grid items-start gap-6 lg:grid-cols-[2fr,3fr]">
          <div className="flex flex-col gap-6">
            <Card className="row-span-2 rounded-2xl border border-border/60 bg-card/60 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-2">
                  <Label>{t("form.currentImageLabel")}</Label>
                  {imageUrl ? (
                    <div className="relative overflow-hidden rounded-xl border border-border/60 bg-muted/20">
                      {currentImageLoading && (
                        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-background/30">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      )}
                      <Image
                        src={imageUrl}
                        alt={item.title}
                        width={item.width}
                        height={item.height}
                        className={`h-auto w-full object-cover transition-opacity duration-300 ${currentImageLoading ? "opacity-0" : "opacity-100"}`}
                        loading="eager"
                        onLoad={() => setCurrentImageLoading(false)}
                      />
                    </div>
                  ) : (
                    <Text className="text-sm text-muted-foreground">
                      {t("form.noImage")}
                    </Text>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-6">
            <Card className="rounded-2xl border border-border/60 bg-card/60 shadow-lg">
              <CardContent className="pt-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldContent>
                      <div className="flex items-baseline justify-between gap-2">
                        <FieldLabel htmlFor="title">
                          {t("form.titleLabel")}
                        </FieldLabel>
                        {errors.title ? (
                          <span
                            role="alert"
                            className="text-xs text-destructive"
                          >
                            {t("form.titleRequired")}
                          </span>
                        ) : null}
                      </div>
                      <Input
                        id="title"
                        type="text"
                        aria-invalid={!!errors.title || undefined}
                        className={
                          errors.title ? "border-destructive/60" : undefined
                        }
                        placeholder={t("form.titlePlaceholder")}
                        {...register("title", {
                          required: t("form.titleRequired"),
                        })}
                      />
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldContent>
                      <div className="flex items-baseline justify-between gap-2">
                        <FieldLabel htmlFor="category">
                          {t("form.categoryLabel")}
                        </FieldLabel>
                        {errors.category ? (
                          <span
                            role="alert"
                            className="text-xs text-destructive"
                          >
                            {errors.category.message}
                          </span>
                        ) : null}
                      </div>
                      <Controller
                        control={control}
                        name="category"
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger
                              id="category"
                              aria-invalid={!!errors.category || undefined}
                              className={
                                errors.category
                                  ? "border-destructive/60"
                                  : undefined
                              }
                            >
                              <SelectValue
                                placeholder={t("form.categoryPlaceholder")}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {PORTFOLIO_CATEGORIES.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat.charAt(0).toUpperCase() +
                                    cat.slice(1).replace("-", " ")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </FieldContent>
                  </Field>
                </div>

                <div className="mt-6 space-y-6">
                  <Field>
                    <FieldContent>
                      <div className="flex items-baseline justify-between gap-2">
                        <FieldLabel htmlFor="description">
                          {t("form.descriptionLabel")}
                        </FieldLabel>
                        <FieldDescription>
                          {t("form.optionalTag")}
                        </FieldDescription>
                      </div>
                      <Textarea
                        id="description"
                        rows={3}
                        aria-invalid={!!errors.description || undefined}
                        className={
                          errors.description
                            ? "border-destructive/60"
                            : undefined
                        }
                        {...register("description", {
                          required: false,
                        })}
                        placeholder={t("form.descriptionPlaceholder")}
                      />
                    </FieldContent>
                  </Field>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-border/60 bg-card/60 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-2">
                  <Label>{t("form.imageLabel")}</Label>
                  <ImageUploader
                    folder="portfolio"
                    maxFiles={1}
                    useOverwrite={true}
                    showPreviewGrid={false}
                    onUploadComplete={(data) => {
                      if (data[0]) {
                        setValue("imageUrl", data[0].url, {
                          shouldDirty: true,
                        });
                        setCurrentImageLoading(true);
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="accent"
                type="submit"
                disabled={!isDirty || saving || !imageUrl}
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" />
                    {actionsT("saving")}
                  </>
                ) : (
                  <>
                    <Save />
                    {actionsT("save")}
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" href={backHref}>
                {actionsT("cancel")}
              </Button>
              <Button
                type="button"
                variant="destructive"
                aria-label={actionsT("delete")}
                onClick={() => setDeleteItem(item)}
              >
                <Trash2 />
                {actionsT("delete")}
              </Button>
            </div>
          </div>
        </div>
      </form>

      <DeleteConfirmDialog
        open={!!deleteItem}
        title={t("deleteTitle")}
        description={
          deleteItem ? t("deleteConfirm", { title: deleteItem.title }) : ""
        }
        cancelLabel={actionsT("cancel")}
        confirmLabel={actionsT("delete")}
        confirmLoadingLabel={actionsT("deleting")}
        onConfirm={handleDelete}
        onCancel={() => setDeleteItem(null)}
      />
    </div>
  );
}
