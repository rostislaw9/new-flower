"use client";

import { useCallback, useMemo, useState } from "react";

import { useTranslations } from "next-intl";
import Image from "next/image";

import { Check, ImageUp, LoaderCircle, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/styled/Button";
import { Text } from "@/components/styled/Typography";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import { uploadToCloudinaryAction } from "@/lib/actions/upload";
import { cn } from "@/lib/utils";

interface ImageUpload {
  file: File | null;
  preview: string;
  uploading: boolean;
  uploaded: boolean;
  error?: string | undefined;
  url?: string | undefined;
  publicId?: string | undefined;
  width?: number | undefined;
  height?: number | undefined;
  name?: string | undefined;
  meta?: string | undefined;
}

interface InitialImage {
  url: string;
  name?: string | undefined;
  meta?: string | undefined;
}

interface ImageUploaderProps {
  folder: string;
  onUploadComplete?: (
    data: {
      url: string;
      width: number;
      height: number;
      name?: string | undefined;
      meta?: string | undefined;
    }[],
  ) => void;
  maxFiles?: number;
  allowedTypes?: string[];
  showPreviewGrid?: boolean;
  useOverwrite?: boolean;
  keepUploadedImages?: boolean;
  initialImages?: InitialImage[];
}

function deriveNameAndMeta(
  url: string,
  name?: string | undefined,
  meta?: string | undefined,
  allUploadedLabel?: string,
) {
  const pathName = name ?? url.split("/").pop()?.split("?")[0] ?? url;
  const ext = pathName.split(".").pop()?.toUpperCase() ?? "";
  const fallbackMeta = ext
    ? `${ext} · ${allUploadedLabel ?? ""}`
    : (allUploadedLabel ?? "");
  return { name: pathName, meta: meta ?? fallbackMeta };
}

export function ImageUploader({
  folder,
  onUploadComplete,
  maxFiles = 10,
  allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"],
  showPreviewGrid = true,
  useOverwrite = false,
  keepUploadedImages = false,
  initialImages = [],
}: ImageUploaderProps) {
  const t = useTranslations("imageUploader");
  const [images, setImages] = useState<ImageUpload[]>(() =>
    initialImages
      .filter((img) => img.url)
      .map((img) => {
        const { name, meta } = deriveNameAndMeta(
          img.url,
          img.name,
          img.meta,
          t("status.allUploaded"),
        );
        return {
          file: null,
          preview: img.url,
          uploading: false,
          uploaded: true,
          url: img.url,
          name,
          meta,
        } as ImageUpload;
      }),
  );
  const [isDragging, setIsDragging] = useState(false);
  const sizeLimitMb = 10;

  const formattedTypes = useMemo(() => {
    const formatType = (type: string) => {
      if (type.startsWith("image/")) {
        const subtype = type.split("/")[1] ?? type;
        return subtype === "jpeg" ? "JPG" : subtype.toUpperCase();
      }
      return type.toUpperCase();
    };
    return allowedTypes.map(formatType).join(", ");
  }, [allowedTypes]);

  const uploadImages = useCallback(
    async (images: ImageUpload[]) => {
      const uploadPromises = images.map(async (image) => {
        if (image.uploaded) return;

        setImages((prev) =>
          prev.map((img) =>
            img.file === image.file
              ? { ...img, uploading: true, error: undefined }
              : img,
          ),
        );

        try {
          const result = await uploadToCloudinaryAction(
            image.file!,
            folder,
            useOverwrite,
          );

          if (result.success && result.data) {
            const data = result.data;
            const uploadedData = {
              url: data.url,
              width: data.width,
              height: data.height,
              name: image.name,
              meta: image.meta,
            };

            setImages((prev) =>
              prev.map((img) =>
                img.file === image.file
                  ? {
                      ...img,
                      uploading: false,
                      uploaded: true,
                      url: data.url,
                      publicId: data.publicId,
                      width: data.width,
                      height: data.height,
                      name:
                        img.name ?? data.url.split("/").pop()?.split("?")[0],
                    }
                  : img,
              ),
            );

            onUploadComplete?.([uploadedData]);

            if (!keepUploadedImages) {
              setImages((prev) =>
                prev.filter((img) => img.file !== image.file),
              );
            }
          } else {
            throw new Error(result.error || t("alerts.uploadFailed"));
          }
        } catch (err) {
          const message =
            err instanceof Error ? err.message : t("alerts.uploadFailed");
          setImages((prev) =>
            prev.map((img) =>
              img.file === image.file
                ? { ...img, uploading: false, error: message }
                : img,
            ),
          );
        }
      });

      await Promise.all(uploadPromises);
    },
    [folder, useOverwrite, t, onUploadComplete, keepUploadedImages],
  );

  const handleFiles = useCallback(
    (filesOrInput: FileList | HTMLInputElement | null) => {
      const files =
        filesOrInput instanceof FileList ? filesOrInput : filesOrInput?.files;
      const inputElement =
        filesOrInput instanceof HTMLInputElement ? filesOrInput : undefined;
      if (!files) return;

      const newFiles = Array.from(files).filter((file) => {
        if (!allowedTypes.includes(file.type)) {
          toast.error(t("alerts.invalidType.title", { file: file.name }), {
            description: t("alerts.invalidType.description"),
          });
          return false;
        }
        if (file.size > sizeLimitMb * 1024 * 1024) {
          toast.error(
            t("alerts.fileTooLarge.title", {
              file: file.name,
            }),
            {
              description: t("alerts.fileTooLarge.description", {
                size: sizeLimitMb,
              }),
            },
          );
          return false;
        }
        return true;
      });

      if (images.length + newFiles.length > maxFiles) {
        toast.error(t("alerts.maxFiles", { count: maxFiles }));
        return;
      }

      const newImages: ImageUpload[] = newFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        uploading: false,
        uploaded: false,
        url: undefined,
        publicId: undefined,
        name: file.name,
        meta: `${file.type.split("/")[1]?.toUpperCase() ?? ""} · ${Math.round(file.size / 1024)} KB`,
      }));

      setImages((prev) => [...prev, ...newImages]);

      // Clear input value so same file can be selected again
      if (inputElement) {
        inputElement.value = "";
      }

      if (!showPreviewGrid) {
        uploadImages(newImages);
      }
    },
    [
      images.length,
      maxFiles,
      allowedTypes,
      sizeLimitMb,
      t,
      showPreviewGrid,
      uploadImages,
    ],
  );

  const removeImage = (index: number) => {
    setImages((prev) => {
      const img = prev[index];
      if (img?.preview) {
        URL.revokeObjectURL(img.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const allUploaded = images.length > 0 && images.every((img) => img.uploaded);
  const isUploading = images.some((img) => img.uploading);

  const fileInputId = useMemo(() => `file-input-${Math.random()}`, []);

  const dropSpecs = useMemo(() => {
    return t("dropzone.specs", {
      count: maxFiles,
      size: sizeLimitMb,
      types: formattedTypes,
    });
  }, [formattedTypes, maxFiles, sizeLimitMb, t]);

  return (
    <div className="flex flex-col gap-4">
      {/* Drop Zone */}
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors",
          isDragging
            ? "border-foreground bg-foreground/5"
            : "hover:bg-foreground/2 border-border hover:border-foreground/30",
        )}
      >
        <input
          id={fileInputId}
          type="file"
          multiple
          accept={allowedTypes.join(",")}
          onChange={(e) => handleFiles(e.target)}
          className="hidden"
        />
        {isUploading && !showPreviewGrid ? (
          <>
            <LoaderCircle className="mx-auto mb-2 animate-spin text-muted-foreground" />
            <Text muted>{t("actions.uploading.title")}</Text>
            <Text size="xs" muted>
              {t("actions.uploading.hint")}
            </Text>
          </>
        ) : (
          <div className="flex flex-col gap-1">
            <div>
              <ImageUp className="mx-auto mb-2 text-muted-foreground" />
              <Text muted>
                {t("dropzone.hint.action")} <br className="md:hidden" />
                {t("dropzone.hint.actionSecondary")}
              </Text>
            </div>
            <Text size="xs" muted>
              {dropSpecs}
            </Text>
          </div>
        )}
      </label>

      {/* Preview Grid */}
      {showPreviewGrid && images.length > 0 && (
        <AttachmentGroup>
          {images.map((image, index) => {
            const state = image.error
              ? "error"
              : image.uploading
                ? "uploading"
                : image.uploaded
                  ? "done"
                  : "idle";
            const fileName =
              image.name ?? t("previewAlt", { index: index + 1 });
            const fileMeta =
              image.error ??
              image.meta ??
              (image.uploaded ? t("status.allUploaded") : "");

            return (
              <Attachment
                key={index}
                orientation="vertical"
                state={state}
                className="p-1"
              >
                <AttachmentMedia
                  variant="image"
                  className="relative rounded-xl"
                >
                  <Image
                    src={image.url || image.preview}
                    fill
                    sizes="96px"
                    alt={t("previewAlt", { index: index + 1 })}
                    className="h-full w-full object-cover"
                  />
                  {image.uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <LoaderCircle className="size-6 animate-spin text-white" />
                    </div>
                  )}
                  {image.uploaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-green-500/50">
                      <Check className="size-6 text-white" />
                    </div>
                  )}
                </AttachmentMedia>
                <AttachmentContent>
                  <AttachmentTitle>{fileName}</AttachmentTitle>
                  <AttachmentDescription className="text-2xs">
                    {fileMeta}
                  </AttachmentDescription>
                </AttachmentContent>
                <AttachmentActions className="-m-4">
                  {image.error && (
                    <AttachmentAction
                      type="button"
                      onClick={() => uploadImages([image])}
                      variant="default"
                      className="rounded-full"
                      aria-label={t("actions.retry")}
                    >
                      <RefreshCw />
                    </AttachmentAction>
                  )}
                  {!image.uploading && !image.uploaded && (
                    <AttachmentAction
                      type="button"
                      onClick={() => removeImage(index)}
                      variant="destructive"
                      className="rounded-full"
                      aria-label={`Remove ${image.file}`}
                    >
                      <X />
                    </AttachmentAction>
                  )}
                </AttachmentActions>
              </Attachment>
            );
          })}
        </AttachmentGroup>
      )}

      {/* ImageUp Button */}
      {showPreviewGrid && images.length > 0 && !allUploaded && (
        <Button
          onClick={() => uploadImages(images)}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <LoaderCircle className="animate-spin" />
              {t("actions.uploading.title")}
            </>
          ) : (
            <>
              <ImageUp />
              {t("actions.upload")}
            </>
          )}
        </Button>
      )}

      {allUploaded && (
        <div className="flex items-center gap-2 text-green-600">
          <Check className="h-4 w-4" />
          <Text>{t("status.allUploaded")}</Text>
        </div>
      )}
    </div>
  );
}
