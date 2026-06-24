"use client";

import { useCallback, useEffect, useState } from "react";

import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/styled/Button";
import { Heading, Text } from "@/components/styled/Typography";
import { Card, CardContent } from "@/components/ui/card";
import { type Locale, defaultLocale } from "@/i18n/config";
import {
  deleteArtistPortrait,
  deleteShopLogo,
  getArtistImages,
  saveArtistPortrait,
  saveShopLogo,
} from "@/lib/actions/artist-images";
import { uploadToCloudinaryAction } from "@/lib/actions/upload";
import { getLocalizedPath, isSupportedLocale } from "@/lib/locale-utils";
import { cn } from "@/lib/utils";

interface ImageUploadState {
  uploading: boolean;
  preview: string | null;
  url: string | null;
}

export default function ArtistImagesPage() {
  const rawLocale = useLocale();
  const locale: Locale = isSupportedLocale(rawLocale)
    ? rawLocale
    : defaultLocale;
  const router = useRouter();
  const t = useTranslations("admin.artistImages");
  const actionsT = useTranslations("admin.common.actions");

  const [portraitState, setPortraitState] = useState<ImageUploadState>({
    uploading: false,
    preview: null,
    url: null,
  });

  const [logoState, setLogoState] = useState<ImageUploadState>({
    uploading: false,
    preview: null,
    url: null,
  });

  const [deleting, setDeleting] = useState<"portrait" | "logo" | null>(null);

  // Load current images on mount
  useEffect(() => {
    const loadImages = async () => {
      const images = await getArtistImages();
      if (images.portraitUrl) {
        setPortraitState({
          uploading: false,
          preview: images.portraitUrl,
          url: images.portraitUrl,
        });
      }
      if (images.logoUrl) {
        setLogoState({
          uploading: false,
          preview: images.logoUrl,
          url: images.logoUrl,
        });
      }
    };
    void loadImages();
  }, []);

  const handleFileSelect = useCallback(
    async (
      file: File,
      type: "portrait" | "logo",
      setState: React.Dispatch<React.SetStateAction<ImageUploadState>>,
    ) => {
      const preview = URL.createObjectURL(file);
      setState({ uploading: true, preview, url: null });

      try {
        const result = await uploadToCloudinaryAction(file, "artist-images");

        if (result.success && result.data) {
          const url = result.data.url;
          setState({ uploading: false, preview, url });

          // Save to public folder
          const saveResult =
            type === "portrait"
              ? await saveArtistPortrait(url)
              : await saveShopLogo(url);

          if (saveResult.success) {
            toast.success(
              type === "portrait"
                ? t("alerts.portraitSaved")
                : t("alerts.logoSaved"),
            );
            // Revalidate the page to show updated images
            router.refresh();
          } else {
            toast.error(saveResult.error || t("alerts.saveFailed"));
            setState({ uploading: false, preview: null, url: null });
          }
        } else {
          toast.error(result.error || t("alerts.uploadFailed"));
          setState({ uploading: false, preview: null, url: null });
        }
      } catch (error) {
        console.error(`[ArtistImagesPage] Error uploading ${type}:`, error);
        toast.error(t("alerts.uploadFailed"));
        setState({ uploading: false, preview: null, url: null });
      }
    },
    [t, router],
  );

  const handlePortraitDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelect(files[0]!, "portrait", setPortraitState);
      }
    },
    [handleFileSelect],
  );

  const handleLogoDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelect(files[0]!, "logo", setLogoState);
      }
    },
    [handleFileSelect],
  );

  const handlePortraitInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.currentTarget.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]!, "portrait", setPortraitState);
      }
    },
    [handleFileSelect],
  );

  const handleLogoInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.currentTarget.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]!, "logo", setLogoState);
      }
    },
    [handleFileSelect],
  );

  const handleDeletePortrait = useCallback(async () => {
    setDeleting("portrait");
    try {
      const result = await deleteArtistPortrait();
      if (result.success) {
        setPortraitState({ uploading: false, preview: null, url: null });
        toast.success(t("alerts.portraitDeleted"));
        router.refresh();
      } else {
        toast.error(result.error || t("alerts.deleteFailed"));
      }
    } catch (error) {
      console.error("[handleDeletePortrait] Error:", error);
      toast.error(t("alerts.deleteFailed"));
    } finally {
      setDeleting(null);
    }
  }, [t, router]);

  const handleDeleteLogo = useCallback(async () => {
    setDeleting("logo");
    try {
      const result = await deleteShopLogo();
      if (result.success) {
        setLogoState({ uploading: false, preview: null, url: null });
        toast.success(t("alerts.logoDeleted"));
        router.refresh();
      } else {
        toast.error(result.error || t("alerts.deleteFailed"));
      }
    } catch (error) {
      console.error("[handleDeleteLogo] Error:", error);
      toast.error(t("alerts.deleteFailed"));
    } finally {
      setDeleting(null);
    }
  }, [t, router]);

  const backHref = getLocalizedPath("/admin", locale);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <Link href={backHref}>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft />
              {actionsT("back")}
            </Button>
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Artist Portrait */}
        <Card className="rounded-2xl border border-border/60 bg-card/60 shadow-lg">
          <CardContent className="flex flex-col gap-6 pt-6">
            <div>
              <Heading size="sm" serif={false}>
                {t("portrait.title")}
              </Heading>
              <Text size="sm" muted>
                {t("portrait.description")}
              </Text>
            </div>

            {/* Upload Area */}
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={handlePortraitDrop}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors",
                portraitState.uploading
                  ? "border-border bg-muted/20"
                  : "border-border hover:border-foreground/30",
              )}
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePortraitInput}
                disabled={portraitState.uploading}
                className="hidden"
              />
              {portraitState.uploading ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <Text size="sm" muted>
                    {t("status.uploading")}
                  </Text>
                </>
              ) : (
                <>
                  <Text size="sm" muted>
                    {t("portrait.hint")}
                  </Text>
                </>
              )}
            </label>

            {/* Preview */}
            {portraitState.preview && (
              <div className="flex flex-col gap-3">
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-border/60 bg-muted/20">
                  <Image
                    src={portraitState.preview}
                    alt="Portrait preview"
                    fill
                    className="object-cover"
                  />
                  {(portraitState.uploading || deleting === "portrait") && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDeletePortrait}
                  disabled={deleting === "portrait"}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleting === "portrait"
                    ? actionsT("deleting")
                    : actionsT("delete")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shop Logo */}
        <Card className="rounded-2xl border border-border/60 bg-card/60 shadow-lg">
          <CardContent className="flex flex-col gap-6 pt-6">
            <div>
              <Heading size="sm" serif={false}>
                {t("logo.title")}
              </Heading>
              <Text size="sm" muted>
                {t("logo.description")}
              </Text>
            </div>

            {/* Upload Area */}
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleLogoDrop}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors",
                logoState.uploading
                  ? "border-border bg-muted/20"
                  : "border-border hover:border-foreground/30",
              )}
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleLogoInput}
                disabled={logoState.uploading}
                className="hidden"
              />
              {logoState.uploading ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <Text size="sm" muted>
                    {t("status.uploading")}
                  </Text>
                </>
              ) : (
                <>
                  <Text size="sm" muted>
                    {t("logo.hint")}
                  </Text>
                </>
              )}
            </label>

            {/* Preview */}
            {logoState.preview && (
              <div className="flex flex-col gap-3">
                <div className="relative aspect-square overflow-hidden rounded-xl border border-border/60 bg-muted/20">
                  <Image
                    src={logoState.preview}
                    alt="Logo preview"
                    fill
                    className="object-cover"
                  />
                  {(logoState.uploading || deleting === "logo") && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDeleteLogo}
                  disabled={deleting === "logo"}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleting === "logo"
                    ? actionsT("deleting")
                    : actionsT("delete")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
