"use client";

import { use, useEffect, useMemo, useState } from "react";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { ArrowLeft, Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Badge } from "@/components/styled/Badge";
import { Button } from "@/components/styled/Button";
import { DeleteConfirmDialog } from "@/components/styled/DeleteConfirmDialog";
import { FormField } from "@/components/styled/FormField";
import { Text } from "@/components/styled/Typography";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { Locale } from "@/i18n/config";
import { defaultLocale } from "@/i18n/config";
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
  const [item, setItem] = useState<PortfolioItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<PortfolioItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [category, setCategory] = useState("");
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
        setImageUrl(data.imageUrl);
        setCategory(data.category);
        setCurrentImageLoading(true);
      } catch {
        const message = t("edit.alerts.loadFailed");
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    void fetchItem();
  }, [id, t]);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("imageUrl", imageUrl);

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
        <div className="flex items-center gap-4">
          <Button
            size="sm"
            variant="outline"
            href={getLocalizedPath("/admin/portfolio", locale)}
          >
            <ArrowLeft />
            {actionsT("back")}
          </Button>
        </div>
        <Text className="text-muted-foreground">
          {t("edit.alerts.notFound")}
        </Text>
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
            href={getLocalizedPath("/admin/portfolio", locale)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft />
            {actionsT("back")}
          </Button>
        }
      />

      {error && (
        <div className="border border-red-200 bg-red-950/50 p-4 text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid gap-6 lg:grid-cols-[3fr,2fr]">
          <Card className="rounded-2xl border border-border/60 bg-card/60 shadow-lg">
            <CardContent className="pt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label={t("form.titleLabel")} htmlFor="title">
                  <Input
                    id="title"
                    name="title"
                    type="text"
                    required
                    placeholder={t("form.titlePlaceholder")}
                    defaultValue={item.title}
                  />
                </FormField>

                <FormField label={t("form.categoryLabel")} htmlFor="category">
                  <input type="hidden" name="category" value={category} />

                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
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
                </FormField>
              </div>

              <div className="mt-6 space-y-6">
                <FormField
                  label={t("form.descriptionLabel")}
                  htmlFor="description"
                  hint={t("form.optionalTag")}
                >
                  <Textarea
                    id="description"
                    name="description"
                    rows={3}
                    defaultValue={item.description ?? ""}
                    placeholder={t("form.descriptionPlaceholder")}
                  />
                </FormField>

                <div className="flex flex-col gap-4 rounded-xl border border-dashed border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      name="featured"
                      defaultChecked={item.featured}
                      className="border-accent data-[state=checked]:bg-accent"
                    />
                    <Badge variant="accent">{t("form.featuredLabel")}</Badge>
                  </div>
                  <div className="w-full sm:w-auto">
                    <FormField
                      label={t("form.orderLabel")}
                      htmlFor="displayOrder"
                    >
                      <Input
                        type="number"
                        name="displayOrder"
                        defaultValue={item.displayOrder}
                        min={0}
                        inputMode="numeric"
                      />
                    </FormField>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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

          <Card className="rounded-2xl border border-border/60 bg-card/60 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-2">
                <Label>{t("form.imageLabel")}</Label>
                <ImageUploader
                  folder="portfolio"
                  maxFiles={1}
                  onUploadComplete={(data) => {
                    if (data[0]) {
                      setImageUrl(data[0].url);
                      setCurrentImageLoading(true);
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="accent" type="submit" disabled={saving || !imageUrl}>
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
