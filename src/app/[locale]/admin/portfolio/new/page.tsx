"use client";

import { useState } from "react";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Badge } from "@/components/styled/Badge";
import { Button } from "@/components/styled/Button";
import { FormField } from "@/components/styled/FormField";
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
import { createPortfolioItem } from "@/lib/actions/portfolio";
import { getLocalizedPath, isSupportedLocale } from "@/lib/locale-utils";
import { PORTFOLIO_CATEGORIES } from "@/lib/portfolio-data";

export default function NewPortfolioItemPage() {
  const router = useRouter();
  const rawLocale = useLocale();
  const locale: Locale = isSupportedLocale(rawLocale)
    ? rawLocale
    : defaultLocale;
  const t = useTranslations("admin.portfolio");
  const actionsT = useTranslations("admin.common.actions");
  const [creating, setCreating] = useState(false);
  const [category, setCategory] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  async function handleSubmit(formData: FormData) {
    if (!uploadedImageUrl) {
      toast.error(t("new.alerts.uploadRequired"));
      return;
    }

    setCreating(true);
    try {
      formData.append("imageUrl", uploadedImageUrl);
      if (imageDimensions) {
        formData.append("width", imageDimensions.width.toString());
        formData.append("height", imageDimensions.height.toString());
      }
      const result = await createPortfolioItem(formData);

      if (result.success) {
        toast.success(t("new.alerts.created"));
        router.push(`/${locale}/admin/portfolio`);
        router.refresh();
      } else {
        toast.error(result.message || t("new.alerts.createFailed"));
      }
    } catch {
      toast.error(t("new.alerts.genericError"));
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={t("new.title")}
        subtitle={t("new.subtitle")}
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

      <form action={handleSubmit} className="flex flex-col gap-6">
        <Card className="rounded-2xl border border-border/60 bg-card/60 shadow-lg">
          <CardContent className="pt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label={t("form.titleLabel")} htmlFor="title" required>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  required
                  placeholder={t("form.titlePlaceholder")}
                />
              </FormField>

              <FormField
                label={t("form.categoryLabel")}
                htmlFor="category"
                required
              >
                <input type="hidden" name="category" value={category} />

                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder={t("form.categoryPlaceholder")} />
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

            <div className="mt-6 flex flex-col gap-6">
              <FormField
                label={t("form.descriptionLabel")}
                htmlFor="description"
                hint={t("form.optionalTag")}
              >
                <Textarea
                  id="description"
                  name="description"
                  rows={3}
                  placeholder={t("form.descriptionPlaceholder")}
                />
              </FormField>

              <div className="flex flex-col gap-4 rounded-xl border border-dashed border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    name="featured"
                    defaultChecked={false}
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
                      min={0}
                      inputMode="numeric"
                    />
                  </FormField>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border/60 bg-card/60 shadow-lg">
          <CardContent className="pt-6">
            <Label>{t("form.imageLabel")}</Label>
            <ImageUploader
              folder="portfolio"
              maxFiles={1}
              onUploadComplete={(data) => {
                if (data[0]) {
                  setUploadedImageUrl(data[0].url);
                  setImageDimensions({
                    width: data[0].width,
                    height: data[0].height,
                  });
                }
              }}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="accent"
            type="submit"
            disabled={creating || !uploadedImageUrl}
          >
            {creating ? (
              <>
                <Loader2 className="animate-spin" />
                {actionsT("creating")}
              </>
            ) : (
              <>
                <Plus />
                {actionsT("create")}
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/${locale}/admin/portfolio`)}
          >
            {actionsT("cancel")}
          </Button>
        </div>
      </form>
    </div>
  );
}
