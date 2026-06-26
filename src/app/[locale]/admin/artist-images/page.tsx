"use client";

import { useCallback, useEffect, useState } from "react";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Button } from "@/components/styled/Button";
import { Heading, Text } from "@/components/styled/Typography";
import { Card, CardContent } from "@/components/ui/card";
import {
  deleteArtistPortrait,
  deleteShopLogo,
  getArtistImages,
  saveArtistPortrait,
  saveShopLogo,
} from "@/lib/actions/artist-images";

export default function ArtistImagesPage() {
  const router = useRouter();
  const t = useTranslations("admin.artistImages");
  const actionsT = useTranslations("admin.common.actions");

  const [portraitUrl, setPortraitUrl] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<"portrait" | "logo" | null>(null);

  useEffect(() => {
    const loadImages = async () => {
      const images = await getArtistImages();
      if (images.portraitUrl) {
        setPortraitUrl(images.portraitUrl);
      }
      if (images.logoUrl) {
        setLogoUrl(images.logoUrl);
      }
    };
    void loadImages();
  }, []);

  const handleDeletePortrait = useCallback(async () => {
    setDeleting("portrait");
    try {
      const result = await deleteArtistPortrait();
      if (result.success) {
        setPortraitUrl(null);
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
        setLogoUrl(null);
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

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="grid items-start gap-6 lg:grid-cols-2">
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
            <ImageUploader
              folder="artist-images"
              maxFiles={1}
              useOverwrite={true}
              showPreviewGrid={false}
              onUploadComplete={async (data) => {
                if (data[0]) {
                  const url = data[0].url;
                  setPortraitUrl(url);
                  // Save to public folder
                  const saveResult = await saveArtistPortrait(url);

                  if (saveResult.success) {
                    toast.success(t("alerts.portraitSaved"));
                    // Revalidate the page to show updated images
                    router.refresh();
                  } else {
                    toast.error(saveResult.error || t("alerts.saveFailed"));
                    setPortraitUrl(null);
                  }
                }
              }}
            />

            {/* Preview */}
            {portraitUrl && (
              <div className="flex flex-col gap-3">
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
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-border/60 bg-muted/20">
                  <Image
                    src={portraitUrl}
                    alt="Portrait preview"
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                    loading="eager"
                  />
                </div>
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
            <ImageUploader
              folder="artist-images"
              maxFiles={1}
              useOverwrite={true}
              showPreviewGrid={false}
              onUploadComplete={async (data) => {
                if (data[0]) {
                  const url = data[0].url;
                  setLogoUrl(url);
                  // Save to public folder
                  const saveResult = await saveShopLogo(url);

                  if (saveResult.success) {
                    toast.success(t("alerts.logoSaved"));
                    // Revalidate the page to show updated images
                    router.refresh();
                  } else {
                    toast.error(saveResult.error || t("alerts.saveFailed"));
                    setLogoUrl(null);
                  }
                }
              }}
            />

            {/* Preview */}
            {logoUrl && (
              <div className="flex flex-col gap-3">
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
                <div className="relative aspect-square overflow-hidden rounded-xl border border-border/60 bg-muted/20">
                  <Image
                    src={logoUrl}
                    alt="Logo preview"
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                    loading="eager"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
