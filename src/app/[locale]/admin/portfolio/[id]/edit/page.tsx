"use client";

import { use, useEffect, useState } from "react";

import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Badge } from "@/components/styled/Badge";
import { Button } from "@/components/styled/Button";
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
import { updatePortfolioItem } from "@/lib/actions/portfolio";
import type { PortfolioItem } from "@/lib/portfolio-data";
import { PORTFOLIO_CATEGORIES } from "@/lib/portfolio-data";

interface EditPortfolioItemPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default function EditPortfolioItemPage({
  params,
}: EditPortfolioItemPageProps) {
  const { id, locale } = use(params);
  const router = useRouter();
  const t = useTranslations("admin.portfolio");
  const actions = useTranslations("admin.common.actions");
  const [item, setItem] = useState<PortfolioItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await fetch(`/api/portfolio/${id}`);
        if (!response.ok) throw new Error(t("edit.alerts.notFound"));
        const data = (await response.json()) as PortfolioItem;
        setItem(data);
        setImageUrl(data.imageUrl);
        setCategory(data.category);
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("imageUrl", imageUrl);

    const result = await updatePortfolioItem(id, formData);

    if (result.success) {
      toast.success(t("edit.alerts.updated"));
      router.push(`/${locale}/admin/portfolio`);
    } else {
      const message = result.message || t("edit.alerts.updateFailed");
      toast.error(message);
      setError(message);
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/admin/portfolio`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {actions("back")}
            </Button>
          </Link>
        </div>
        <Text className="text-muted-foreground">
          {t("edit.alerts.notFound")}
        </Text>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader title={t("edit.title")} subtitle={t("edit.subtitle")} />

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
                      className="border-accent"
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
                  <Image
                    src={imageUrl}
                    alt={item.title}
                    width={item.width}
                    height={item.height}
                    className="h-auto w-full rounded-lg rounded-xl object-cover"
                    loading="eager"
                  />
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
                {actions("saving")}
              </>
            ) : (
              <>
                <Save />
                {actions("save")}
              </>
            )}
          </Button>
          <Link href={`/${locale}/admin/portfolio`}>
            <Button variant="outline" type="button" className="w-full">
              {actions("cancel")}
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
